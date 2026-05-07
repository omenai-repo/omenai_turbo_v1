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

vi.mock("@omenai/shared-lib/analytics/getCoreFinancials", () => ({
  getCoreFinancials: vi.fn(),
}));

vi.mock("@omenai/shared-lib/analytics/getFinancialChartData", () => ({
  getFinancialChartData: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/admin/analytics/getFinancialMetrics/route";
import { getCoreFinancials } from "@omenai/shared-lib/analytics/getCoreFinancials";
import { getFinancialChartData } from "@omenai/shared-lib/analytics/getFinancialChartData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockCoreResponse = {
  success: true,
  data: {
    health: {
      realizedGMV: 50000,
      trueAOV: 1200,
      taxLiability: 3000,
      averageShipping: 85,
    },
    funnel: {
      potentialRevenue: 12000,
      abandonedRevenue: 4000,
      ghostedRevenue: 2000,
    },
  },
};

const mockChartResponse = {
  success: true,
  data: [
    { month: "Jan", netRevenue: 4000 },
    { month: "Feb", netRevenue: 5500 },
  ],
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/admin/analytics/getFinancialMetrics");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/admin/analytics/getFinancialMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCoreFinancials).mockResolvedValue(mockCoreResponse as any);
    vi.mocked(getFinancialChartData).mockResolvedValue(mockChartResponse as any);
  });

  it("returns 200 with formatted financial data on success", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.kpis).toBeDefined();
    expect(body.data.trendChart).toEqual(mockChartResponse.data);
  });

  it("passes year query param to getFinancialChartData", async () => {
    await GET(makeRequest({ year: "2023" }));

    expect(getFinancialChartData).toHaveBeenCalledWith("2023");
  });

  it("defaults year to current year when param is absent", async () => {
    await GET(makeRequest());

    const currentYear = new Date().getFullYear().toString();
    expect(getFinancialChartData).toHaveBeenCalledWith(currentYear);
  });

  it("includes KPIs with realizedGMV and trueAOV", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.data.kpis.realizedGMV).toBe(50000);
    expect(body.data.kpis.trueAOV).toBe(1200);
  });

  it("returns 500 when getCoreFinancials returns success:false", async () => {
    vi.mocked(getCoreFinancials).mockResolvedValue({ success: false } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("returns 500 when getFinancialChartData returns success:false", async () => {
    vi.mocked(getFinancialChartData).mockResolvedValue({ success: false } as any);

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 500 when services throw", async () => {
    vi.mocked(getCoreFinancials).mockRejectedValue(new Error("Aggregation error"));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });
});
