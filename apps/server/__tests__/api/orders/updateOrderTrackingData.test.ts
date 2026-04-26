import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOneAndUpdate: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/updateOrderTrackingData/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

const trackingData = { id: "track-001", link: "https://track.example.com", delivery_status: "in_transit" };
const validBody = { order_id: "order-abc", data: trackingData };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/updateOrderTrackingData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/updateOrderTrackingData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue({ order_id: "order-abc" } as any);
  });

  it("returns 200 when tracking data updated", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully updated tracking information");
    expect(CreateOrder.findOneAndUpdate).toHaveBeenCalledWith(
      { order_id: "order-abc" },
      { $set: { "shipping_details.shipment_information.tracking": trackingData } },
    );
  });

  it("returns 500 when order not found", async () => {
    vi.mocked(CreateOrder.findOneAndUpdate).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/could not be updated/i);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(makeRequest({ data: trackingData }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
