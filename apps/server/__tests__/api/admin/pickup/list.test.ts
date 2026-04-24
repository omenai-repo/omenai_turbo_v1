import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
  strictRateLimit: {},
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

vi.mock("@omenai/shared-models/models/crons/FailedPickup", () => ({
  FailedPickup: {
    find: vi.fn(),
  },
}));

import { GET } from "../../../../app/api/admin/pickup/list/route";
import { FailedPickup } from "@omenai/shared-models/models/crons/FailedPickup";

function makeRequest(status?: string): Request {
  const url = status
    ? `http://localhost/api/admin/pickup/list?status=${status}`
    : "http://localhost/api/admin/pickup/list";
  return new Request(url, { method: "GET" });
}

const mockPendingPickups = [
  { order_id: "order-1", status: "pending" },
  { order_id: "order-2", status: "manual_intervention_required" },
];

const mockResolvedPickups = [{ order_id: "order-3", status: "resolved" }];

describe("GET /api/admin/pickup/list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with pending pickups by default", async () => {
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockPendingPickups),
    };
    vi.mocked(FailedPickup.find).mockReturnValue(mockQuery as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockPendingPickups);
    expect(FailedPickup.find).toHaveBeenCalledWith({
      status: { $in: ["pending", "manual_intervention_required"] },
    });
  });

  it("returns 200 with resolved pickups when status=resolved", async () => {
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockResolvedPickups),
    };
    vi.mocked(FailedPickup.find).mockReturnValue(mockQuery as any);

    const response = await GET(makeRequest("resolved"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockResolvedPickups);
    expect(FailedPickup.find).toHaveBeenCalledWith({ status: "resolved" });
  });

  it("returns 500 when FailedPickup.find throws", async () => {
    vi.mocked(FailedPickup.find).mockImplementation(() => {
      throw new Error("DB error");
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
