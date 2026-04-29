import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel", () => ({
  default: { aggregate: vi.fn() },
}));

import { POST } from "../../../app/api/analytics/survey-stats/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockAggregationResult = [
  {
    distinct_countries: [{ _id: "NG", count: 30 }],
    discovery_split: [{ _id: "Social Media", total: 50 }],
    challenges_global: [{ _id: "Pricing", count: 20 }],
    value_drivers_global: [{ _id: "Curation", count: 35 }],
    raw_responses: [{ name: "Ada", email: "ada@test.com", entity: "collector" }],
    total_count: [{ count: 80 }],
  },
];

function makeRequest(body: Record<string, any> = {}): Request {
  return new Request("http://localhost/api/analytics/survey-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analytics/survey-stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(WaitlistLead.aggregate).mockResolvedValue(mockAggregationResult as any);
  });

  it("returns 200 with success:true, stats, and pagination", async () => {
    const response = await POST(makeRequest({ page: 1, limit: 10 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.stats).toBeDefined();
    expect(body.pagination).toBeDefined();
  });

  it("calculates pagination correctly", async () => {
    const response = await POST(makeRequest({ page: 2, limit: 10 }));
    const body = await response.json();

    expect(body.pagination.total).toBe(80);
    expect(body.pagination.pages).toBe(8);
    expect(body.pagination.current).toBe(2);
    expect(body.pagination.limit).toBe(10);
  });

  it("defaults page=1 and limit=50 when not provided", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(body.pagination.current).toBe(1);
    expect(body.pagination.limit).toBe(50);
  });

  it("calls WaitlistLead.aggregate with a pipeline", async () => {
    await POST(makeRequest({ country: "NG" }));

    expect(WaitlistLead.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ $facet: expect.any(Object) })]),
    );
  });

  it("returns empty stats when aggregate returns no results", async () => {
    vi.mocked(WaitlistLead.aggregate).mockResolvedValue([]);

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.stats.distinct_countries).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });

  it("returns 500 when aggregate throws", async () => {
    vi.mocked(WaitlistLead.aggregate).mockRejectedValue(new Error("Aggregation error"));

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
