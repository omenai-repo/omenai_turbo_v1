import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: { findOne: vi.fn(), updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/device_management/DeviceManagementSchema", () => ({
  DeviceManagement: { find: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema", () => ({
  PriceRequest: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/orders/orderRequestToGallery", () => ({
  sendOrderRequestToGalleryMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/orders/orderRequestReceived", () => ({
  sendOrderRequestReceivedMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-utils/src/getCurrentDate", () => ({
  getCurrentDate: vi.fn().mockReturnValue("2026-04-21"),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("99"),
}));

vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    validateRequestBody: vi.fn().mockImplementation(async (request: Request, schema: any) => {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new BadRequestError("Invalid JSON syntax: Request body could not be parsed.");
      }
      const result = schema.safeParse(body);
      if (!result.success) {
        const msg = result.error.issues
          .map((e: any) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new BadRequestError(`Validation Failed: ${msg}`);
      }
      return result.data;
    }),
    validateDHLAddress: vi.fn().mockResolvedValue(undefined),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../app/api/orders/createOrder/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { PriceRequest } from "@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema";
import { validateDHLAddress } from "../../../app/api/util";

const ngAddress = { address_line: "1 Lagos St", city: "Lagos", state: "Lagos", stateCode: "LA", country: "NG", countryCode: "NG", zip: "10001" };

const mockBuyer = { name: "John Doe", email: "buyer@test.com", user_id: "user-1", phone: "+1234", address: ngAddress };
const mockArtist = { name: "Test Artist", email: "artist@test.com", user_id: "artist-1", phone: "+5678", address: ngAddress };
const mockArtwork = {
  art_id: "art-123",
  title: "Test Art",
  artist: "Test Artist",
  pricing: { usd_price: 1000 },
  url: "http://img",
  availability: true,
};
const mockCreatedOrder = { order_id: "order-new-1" };

const validBody = {
  buyer_id: "user-1",
  art_id: "art-123",
  seller_id: "artist-1",
  designation: "artist",
  save_shipping_address: false,
  shipping_address: ngAddress,
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/createOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateDHLAddress).mockResolvedValue(undefined);

    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockBuyer),
    } as any);
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(Artworkuploads.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockArtwork),
    } as any);
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.mocked(CreateOrder.create).mockResolvedValue(mockCreatedOrder as any);
    vi.mocked(AccountIndividual.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(PriceRequest.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(DeviceManagement.find).mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    } as any);
  });

  it("returns 200 when order created for artist designation", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Order created successfully");
    expect(CreateOrder.create).toHaveBeenCalled();
  });

  it("uses UPS carrier for domestic NG-to-NG shipment", async () => {
    await POST(makeRequest(validBody));

    expect(CreateOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        shipping_details: expect.objectContaining({
          shipment_information: expect.objectContaining({ carrier: "UPS" }),
        }),
      }),
    );
  });

  it("saves shipping address when save_shipping_address is true", async () => {
    await POST(makeRequest({ ...validBody, save_shipping_address: true }));

    expect(AccountIndividual.updateOne).toHaveBeenCalledWith(
      { user_id: "user-1" },
      { $set: { address: ngAddress } },
    );
  });

  it("returns 500 when buyer data not found", async () => {
    vi.mocked(AccountIndividual.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/Unable to retrieve user/i);
  });

  it("returns 400 when DHL address validation fails", async () => {
    const intlAddress = { ...ngAddress, countryCode: "GB", country: "UK" };
    vi.mocked(validateDHLAddress).mockRejectedValue(
      new Error("Oops! We can't ship to this address yet."),
    );

    const response = await POST(
      makeRequest({ ...validBody, shipping_address: intlAddress }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/can't ship/i);
  });

  it("returns 500 when artwork not found", async () => {
    vi.mocked(Artworkuploads.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/Artwork not found/i);
  });

  it("returns 403 when order for this artwork is already being processed", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ order_id: "existing-order" }),
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already being processed/i);
  });

  it("returns 400 when buyer_id is missing", async () => {
    const { buyer_id: _, ...bodyWithoutBuyer } = validBody;
    const response = await POST(makeRequest(bodyWithoutBuyer));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
