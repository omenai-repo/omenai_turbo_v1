import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { findOne: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/retrieveOrderLockStatus/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

const mockLockStatus = {
  order_id: "order-abc",
  lock_purchase: "locked",
  artwork_data: { title: "Test Art" },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/retrieveOrderLockStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/retrieveOrderLockStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockLockStatus as any);
  });

  it("returns 200 with lock status", async () => {
    const response = await POST(makeRequest({ order_id: "order-abc" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockLockStatus);
  });

  it("returns 404 when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ order_id: "missing" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/No order matching/i);
  });

  it("returns 400 when order_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
