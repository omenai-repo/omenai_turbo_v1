/**
 * Integration tests for POST /api/analytics/survey-stats
 *
 * Seeds WaitlistLead documents with survey data and verifies the aggregation
 * pipeline returns the correct shape, pagination, and country-filtered results
 * from the real in-memory MongoDB instance.
 *
 * Note: The pipeline filters with { survey: { $exists: true, $ne: null } },
 * so only leads that include a survey field appear in stats results.
 */

import { describe, it, expect, afterEach } from "vitest";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

import { POST } from "../../../app/api/analytics/survey-stats/route";

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeRequest(body: object = {}): Request {
  return new Request("http://localhost/api/analytics/survey-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeLeadWithSurvey(overrides: Record<string, any> = {}) {
  return {
    email: `lead-${Date.now()}-${crypto.randomUUID()}@test.com`,
    name: "Test Lead",
    entity: "artist",
    kpi: {},
    survey: { art_discovery_or_share_method: "social" },
    country: "US",
    ...overrides,
  };
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await WaitlistLead.deleteMany({});
});

// ── Response shape ────────────────────────────────────────────────────────────

describe("POST /api/analytics/survey-stats — response shape", () => {
  it("returns 200 with success=true and correct response shape", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.stats).toBeDefined();
    expect(body.pagination).toBeDefined();
    expect(body.pagination).toHaveProperty("total");
    expect(body.pagination).toHaveProperty("pages");
    expect(body.pagination).toHaveProperty("current");
    expect(body.pagination).toHaveProperty("limit");
  });

  it("returns pagination with total=0 when no leads exist", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(0);
  });

  it("returns distinct_countries in stats", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(Array.isArray(body.stats.distinct_countries)).toBe(true);
  });
});

// ── Country filter ────────────────────────────────────────────────────────────

describe("POST /api/analytics/survey-stats — country filter", () => {
  it("filters by country when provided", async () => {
    await WaitlistLead.create([
      makeLeadWithSurvey({
        email: "us-lead-1@test.com",
        country: "US",
        survey: { art_discovery_or_share_method: "social" },
      }),
      makeLeadWithSurvey({
        email: "us-lead-2@test.com",
        country: "US",
        survey: { art_discovery_or_share_method: "search" },
      }),
      makeLeadWithSurvey({
        email: "fr-lead-1@test.com",
        country: "FR",
        survey: { art_discovery_or_share_method: "word-of-mouth" },
      }),
    ]);

    const res = await POST(makeRequest({ country: "US" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(2);
  });
});
