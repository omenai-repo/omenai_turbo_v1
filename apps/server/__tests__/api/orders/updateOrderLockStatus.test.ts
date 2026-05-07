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
  CreateOrder: { updateMany: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/orders/updateOrderLockStatus/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

const validBody = { art_id: "art-123", lock_status: "locked" };

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/orders/updateOrderLockStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/updateOrderLockStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.updateMany).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  it("returns 200 when lock status updated", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(CreateOrder.updateMany).toHaveBeenCalledWith(
      { "artwork_data.art_id": "art-123" },
      { $set: { lock_purchase: "locked" } },
    );
  });

  it("returns 400 when art_id is missing", async () => {
    const response = await POST(makeRequest({ lock_status: "locked" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when lock_status is missing", async () => {
    const response = await POST(makeRequest({ art_id: "art-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
