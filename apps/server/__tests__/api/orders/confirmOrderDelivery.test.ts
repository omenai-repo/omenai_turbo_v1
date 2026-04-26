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

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { updateOne: vi.fn(), findOne: vi.fn() },
}));

vi.mock("@omenai/shared-emails/src/models/shipment/sendShipmentSuccessEmailToBuyer", () => ({
  sendBuyerShipmentSuccessEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/shipment/sendShipmentSuccessEmailToArtist", () => ({
  sendArtistShipmentSuccessEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/shipment/sendShipmentSuccessEmailToGallery", () => ({
  sendGalleryShipmentSuccessEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn().mockReturnValue("$1,000.00"),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/confirmOrderDelivery/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { sendArtistShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentSuccessEmailToArtist";
import { sendGalleryShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentSuccessEmailToGallery";

const mockArtistOrder = {
  order_id: "order-abc",
  seller_designation: "artist",
  buyer_details: { name: "John", email: "buyer@test.com" },
  seller_details: { name: "Artist", email: "artist@test.com" },
  artwork_data: { title: "Art", artist: "The Artist", url: "http://img", pricing: { usd_price: 1000 } },
};

const mockGalleryOrder = { ...mockArtistOrder, seller_designation: "gallery" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/confirmOrderDelivery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/confirmOrderDelivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockArtistOrder as any);
  });

  it("returns 200 and sends artist email for artist order", async () => {
    const response = await POST(makeRequest({ order_id: "order-abc", confirm_delivery: "confirmed" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully confirmed order delivery.");
    expect(sendArtistShipmentSuccessEmail).toHaveBeenCalled();
  });

  it("returns 200 and sends gallery email for gallery order", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockGalleryOrder as any);

    const response = await POST(makeRequest({ order_id: "order-abc", confirm_delivery: "confirmed" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sendGalleryShipmentSuccessEmail).toHaveBeenCalled();
  });

  it("returns 500 when order not found after update", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ order_id: "order-abc", confirm_delivery: "confirmed" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/Cannot find order/i);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(makeRequest({ confirm_delivery: "confirmed" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
