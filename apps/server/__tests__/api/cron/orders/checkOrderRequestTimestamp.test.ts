import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    bulkWrite: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    bulkWrite: vi.fn(),
  },
}));

vi.mock("resend", () => ({
  Resend: class {
    batch = { send: async () => ({ data: [], error: null }) };
  },
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html>Email</html>"),
}));

vi.mock("@omenai/shared-emails/src/views/order/OrderDeclinedEmail", () => ({
  default: vi.fn(),
}));

vi.mock("@omenai/shared-emails/src/views/order/OrderAutoDeclined", () => ({
  default: vi.fn(),
}));

vi.mock(
  "@omenai/shared-emails/src/views/order/OrderRequessstReminder",
  () => ({
    default: vi.fn(),
  }),
);

vi.mock("@omenai/shared-emails/src/views/order/OrderDeclinedWarning", () => ({
  default: vi.fn(),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/orders/checkOrderRequestTimestamp/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/orders/checkOrderRequestTimestamp",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockAutoDeclinedOrder = {
  order_id: "order-001",
  buyer_details: { name: "Buyer A", email: "buyer@example.com" },
  seller_details: { name: "Seller A", email: "seller@example.com", id: "seller-001" },
  artwork_data: {
    art_id: "art-001",
    title: "Artwork 1",
    artist_name: "Artist A",
    artist: "Artist A",
    image_url: "https://example.com/art.jpg",
    price: 1000,
  },
  order_accepted: { status: "declined" },
};

describe("GET /api/cron/orders/checkOrderRequestTimestamp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue(null);
    vi.mocked(CreateOrder.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);
    vi.mocked(Artworkuploads.bulkWrite).mockResolvedValue({
      modifiedCount: 0,
    } as any);
    vi.mocked(Artworkuploads.find).mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    } as any);
    vi.mocked(AccountArtist.bulkWrite).mockResolvedValue({
      modifiedCount: 0,
    } as any);
  });

  it("returns 200 with completed message when no orders to process", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Order management completed successfully");
  });

  it("returns zero counts when there are no orders", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.autoDeclined).toBe(0);
    expect(body.warningsSent).toBe(0);
    expect(body.remindersSent).toBe(0);
    expect(body.emailErrors).toBe(0);
  });

  it("includes duration in response", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(typeof body.duration).toBe("number");
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("auto-declines orders older than 96 hours and reports the count", async () => {
    vi.mocked(CreateOrder.findOneAndUpdate)
      .mockResolvedValueOnce(mockAutoDeclinedOrder as any)
      .mockResolvedValueOnce(null);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.autoDeclined).toBe(1);
  });

  it("calls findOneAndUpdate with pending status filter for auto-decline", async () => {
    vi.mocked(CreateOrder.findOneAndUpdate)
      .mockResolvedValueOnce(mockAutoDeclinedOrder as any)
      .mockResolvedValueOnce(null);

    await GET(makeRequest());

    expect(CreateOrder.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        "order_accepted.status": "",
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ "order_accepted.status": "declined" }),
      }),
      expect.anything(),
    );
  });

  it("calls Artworkuploads.bulkWrite when auto-declined orders exist", async () => {
    vi.mocked(CreateOrder.findOneAndUpdate)
      .mockResolvedValueOnce(mockAutoDeclinedOrder as any)
      .mockResolvedValueOnce(null);

    await GET(makeRequest());

    expect(Artworkuploads.bulkWrite).toHaveBeenCalled();
  });

  it("sends warning emails for 72-96 hour old orders", async () => {
    const warningOrder = {
      ...mockAutoDeclinedOrder,
      seller_details: { name: "Seller B", email: "seller-b@example.com" },
    };
    vi.mocked(CreateOrder.find)
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValue([warningOrder]) } as any)
      .mockReturnValue({ lean: vi.fn().mockResolvedValue([]) } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.warningsSent).toBe(1);
  });

  it("sends reminder emails for 24-72 hour old orders", async () => {
    const reminderOrder = {
      ...mockAutoDeclinedOrder,
      seller_designation: "gallery",
      seller_details: { name: "Seller C", email: "seller-c@example.com" },
      artwork_data: {
        ...mockAutoDeclinedOrder.artwork_data,
        artist: "Artist A",
        url: "https://img.example.com/art.jpg",
        pricing: { usd_price: 500 },
      },
    };
    vi.mocked(CreateOrder.find)
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValue([]) } as any)
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValue([reminderOrder]) } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.remindersSent).toBe(1);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB Error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
