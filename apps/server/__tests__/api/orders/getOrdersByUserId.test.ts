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
  CreateOrder: { find: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/getOrdersByUserId/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

const mockOrders = [
  { order_id: "order-1", buyer_details: { id: "user-123" } },
  { order_id: "order-2", buyer_details: { id: "user-123" } },
];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/getOrdersByUserId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/getOrdersByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockOrders),
        }),
      }),
    } as any);
  });

  it("returns 200 with orders for user", async () => {
    const response = await POST(makeRequest({ id: "user-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockOrders);
    expect(CreateOrder.find).toHaveBeenCalledWith({ "buyer_details.id": "user-123" });
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
