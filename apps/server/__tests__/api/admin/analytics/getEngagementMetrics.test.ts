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

vi.mock("@omenai/shared-lib/analytics/getEngagementMetrics", () => ({
  getEngagementMetrics: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/admin/analytics/getEngagementMetrics/route";
import { getEngagementMetrics } from "@omenai/shared-lib/analytics/getEngagementMetrics";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockMetricsData = {
  dau: 450,
  mau: 9800,
  avgSessionDuration: 240,
};

describe("GET /api/admin/analytics/getEngagementMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEngagementMetrics).mockResolvedValue({
      success: true,
      data: mockMetricsData,
    } as any);
  });

  it("returns 200 with engagement metrics data on success", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockMetricsData);
    expect(body.message).toBe("Engagement metrics retrieved successfully");
  });

  it("returns 500 when getEngagementMetrics returns success:false", async () => {
    vi.mocked(getEngagementMetrics).mockResolvedValue({ success: false } as any);

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when getEngagementMetrics throws", async () => {
    vi.mocked(getEngagementMetrics).mockRejectedValue(new Error("Aggregation failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
