import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel", () => ({
  default: { aggregate: vi.fn() },
}));

import { POST } from "../../../app/api/analytics/survey-stats/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

function makeRequest(body: object) {
  return new Request("http://localhost/api/analytics/survey-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAggregationResult = [
  {
    distinct_countries: [{ _id: "France", count: 5 }],
    discovery_split: [],
    challenges_global: [],
    value_drivers_global: [],
    raw_responses: [{ name: "Alice", email: "alice@example.com" }],
    total_count: [{ count: 1 }],
  },
];

describe("POST /api/analytics/survey-stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with aggregated stats", async () => {
    vi.mocked(WaitlistLead.aggregate).mockResolvedValue(mockAggregationResult as any);

    const response = await POST(makeRequest({ page: 1, limit: 10 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.stats.distinct_countries).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });

  it("returns default pagination values when none provided", async () => {
    vi.mocked(WaitlistLead.aggregate).mockResolvedValue(mockAggregationResult as any);

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(body.pagination.current).toBe(1);
    expect(body.pagination.limit).toBe(50);
  });

  it("returns 200 with empty stats when no survey data exists", async () => {
    vi.mocked(WaitlistLead.aggregate).mockResolvedValue([
      {
        distinct_countries: [],
        discovery_split: [],
        challenges_global: [],
        value_drivers_global: [],
        raw_responses: [],
        total_count: [],
      },
    ] as any);

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(body.pagination.total).toBe(0);
    expect(body.stats.distinct_countries).toEqual([]);
  });

  it("returns 500 when aggregation fails", async () => {
    vi.mocked(WaitlistLead.aggregate).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
