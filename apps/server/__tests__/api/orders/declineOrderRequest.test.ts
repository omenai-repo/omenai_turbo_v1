import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("mongoose", () => ({
  default: { startSession: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOneAndUpdate: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { findOne: vi.fn(), updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/device_management/DeviceManagementSchema", () => ({
  DeviceManagement: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/orders/orderDeclinedMail", () => ({
  sendOrderDeclinedMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("12"),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d) => d),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/declineOrderRequest/route";
import mongoose from "mongoose";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";

const mockDeclinedOrder = {
  order_id: "order-abc",
  status: "completed",
  buyer_details: { id: "user-1", name: "John", email: "buyer@test.com" },
  order_accepted: { status: "declined", reason: "Not available" },
  artwork_data: { title: "Test Art" },
};

const validGalleryBody = {
  order_id: "order-abc",
  art_id: "art-123",
  seller_designation: "gallery",
  data: { status: "declined", reason: "Not available" },
};

const validArtistBody = {
  order_id: "order-abc",
  art_id: "art-123",
  seller_designation: "artist",
  data: { status: "declined", reason: "On exhibition" },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/declineOrderRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/declineOrderRequest", () => {
  let mockSession: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
      inTransaction: vi.fn().mockReturnValue(false),
    };

    vi.mocked(mongoose.startSession).mockResolvedValue(mockSession as any);
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue(mockDeclinedOrder as any);
    vi.mocked(DeviceManagement.findOne).mockResolvedValue(null);
  });

  it("returns 200 when gallery order is declined successfully", async () => {
    const response = await POST(makeRequest(validGalleryBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully declined order");
    expect(body.data.order_id).toBe("order-abc");
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it("returns 200 when artist order is declined (skips exclusivity check for non-exclusive artwork)", async () => {
    vi.mocked(Artworkuploads.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({
        exclusivity_status: { exclusivity_type: "non-exclusive", exclusivity_end_date: null },
        author_id: "artist-1",
      }),
    } as any);

    const response = await POST(makeRequest(validArtistBody));

    expect(response.status).toBe(200);
    expect(mockSession.commitTransaction).toHaveBeenCalled();
  });

  it("returns 500 when order update fails", async () => {
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue(null);
    mockSession.inTransaction.mockReturnValue(true);

    const response = await POST(makeRequest(validGalleryBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/not found or could not be updated/i);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it("returns 400 when seller_designation is missing", async () => {
    const response = await POST(
      makeRequest({ order_id: "order-abc", art_id: "art-123", data: { status: "declined", reason: "" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(
      makeRequest({ art_id: "art-123", seller_designation: "gallery", data: { status: "declined", reason: "" } }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
