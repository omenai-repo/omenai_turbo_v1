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

vi.mock("@omenai/shared-models/models/crons/FailedPickup", () => ({
  FailedPickup: {
    updateOne: vi.fn(),
  },
}));

import { POST } from "../../../../app/api/admin/pickup/resolve_manual/route";
import { FailedPickup } from "@omenai/shared-models/models/crons/FailedPickup";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/pickup/resolve_manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/pickup/resolve_manual", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(FailedPickup.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  it("returns 200 when pickup is marked as resolved", async () => {
    const response = await POST(makeRequest({ order_id: "order-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Marked as resolved");
    expect(FailedPickup.updateOne).toHaveBeenCalledWith(
      { order_id: "order-123" },
      {
        $set: {
          status: "resolved",
          error_message: "Resolved manually by Admin",
        },
      },
    );
  });

  it("returns 500 when FailedPickup.updateOne throws", async () => {
    vi.mocked(FailedPickup.updateOne).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await POST(makeRequest({ order_id: "order-123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
