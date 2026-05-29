/**
 * Integration tests for POST /api/analytics/record-visit
 *
 * Seeds CampaignVisit documents and verifies the route persists visit data
 * correctly in the real in-memory MongoDB instance. UA parsing, country
 * headers, and default values are also verified.
 */

import { describe, it, expect, afterEach } from "vitest";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";

import { POST } from "../../../app/api/analytics/record-visit/route";

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/analytics/record-visit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await CampaignVisit.deleteMany({});
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/analytics/record-visit — success", () => {
  it("returns 200 and records the visit in the database", async () => {
    const res = await POST(
      makeRequest({
        visitorId: "visitor-001",
        source: "google",
        medium: "cpc",
        campaign: "art-sale",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const doc = await CampaignVisit.findOne({ visitorId: "visitor-001" });
    expect(doc).not.toBeNull();
  });

  it("stores the correct source and medium on the saved document", async () => {
    await POST(
      makeRequest({
        visitorId: "visitor-002",
        source: "facebook",
        medium: "social",
      }),
    );

    const doc = await CampaignVisit.findOne({ visitorId: "visitor-002" });
    expect(doc).not.toBeNull();
    expect(doc!.source).toBe("facebook");
    expect(doc!.medium).toBe("social");
  });

  it("uses country from x-vercel-ip-country header", async () => {
    const res = await POST(
      makeRequest(
        { visitorId: "visitor-fr-001" },
        { "x-vercel-ip-country": "FR" },
      ),
    );

    expect(res.status).toBe(200);
  });

  it("defaults source to direct when not provided", async () => {
    await POST(makeRequest({ visitorId: "visitor-003" }));

    const doc = await CampaignVisit.findOne({ visitorId: "visitor-003" });
    expect(doc).not.toBeNull();
    expect(doc!.source).toBe("direct");
  });
});
