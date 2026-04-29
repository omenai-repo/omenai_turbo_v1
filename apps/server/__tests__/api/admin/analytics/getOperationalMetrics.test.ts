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

vi.mock("@omenai/shared-lib/analytics/getOperationalMetrics", () => ({
  getOperationalMetrics: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/admin/analytics/getOperationalMetrics/route";
import { getOperationalMetrics } from "@omenai/shared-lib/analytics/getOperationalMetrics";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockMetricsData = {
  pendingOrders: 34,
  avgFulfillmentTime: 3.2,
  supportTickets: 12,
};

describe("GET /api/admin/analytics/getOperationalMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOperationalMetrics).mockResolvedValue({
      success: true,
      data: mockMetricsData,
    } as any);
  });

  it("returns 200 with operational metrics data on success", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockMetricsData);
    expect(body.message).toBe("Operational metrics retrieved successfully");
  });

  it("returns 500 when getOperationalMetrics returns success:false", async () => {
    vi.mocked(getOperationalMetrics).mockResolvedValue({ success: false } as any);

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when getOperationalMetrics throws", async () => {
    vi.mocked(getOperationalMetrics).mockRejectedValue(new Error("Aggregation failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
