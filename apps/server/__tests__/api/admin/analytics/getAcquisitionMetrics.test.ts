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

vi.mock("@omenai/shared-lib/analytics/getAcquisitionMetrics", () => ({
  getAcquisitionMetrics: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/admin/analytics/getAcquisitionMetrics/route";
import { getAcquisitionMetrics } from "@omenai/shared-lib/analytics/getAcquisitionMetrics";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockMetricsData = {
  newUsers: 120,
  conversionRate: 0.04,
  churnRate: 0.02,
};

describe("GET /api/admin/analytics/getAcquisitionMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAcquisitionMetrics).mockResolvedValue({
      success: true,
      data: mockMetricsData,
    } as any);
  });

  it("returns 200 with acquisition metrics data on success", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockMetricsData);
    expect(body.message).toBe("Acquisition metrics retrieved successfully");
  });

  it("returns 500 when getAcquisitionMetrics returns success:false", async () => {
    vi.mocked(getAcquisitionMetrics).mockResolvedValue({ success: false } as any);

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when getAcquisitionMetrics throws", async () => {
    vi.mocked(getAcquisitionMetrics).mockRejectedValue(new Error("Aggregation failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
