/**
 * Integration tests for GET /api/subscriptions/retrieveSinglePlan
 *
 * Seeds a SubscriptionPlan and verifies the route finds it by plan_id.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";

import { GET } from "../../../app/api/subscriptions/retrieveSinglePlan/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(planId?: string): Request {
  const url = new URL("http://localhost/api/subscriptions/retrieveSinglePlan");
  if (planId) url.searchParams.set("plan_id", planId);
  return new Request(url.toString(), { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SubscriptionPlan.deleteMany({});
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/subscriptions/retrieveSinglePlan — success", () => {
  let seededPlanId: string;

  beforeEach(async () => {
    const plan = await SubscriptionPlan.create({
      name: "Foundation",
      benefits: { artworks: 20, exhibitions: 1 },
      pricing: { monthly_price: 49, annual_price: 490 },
      currency: "USD",
    });
    seededPlanId = plan.plan_id;
  });

  it("returns 200 with the plan data when found by plan_id", async () => {
    const res = await GET(makeRequest(seededPlanId));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successfull");
    expect(body.data).not.toBeNull();
    expect(body.data.name).toBe("Foundation");
  });

  it("returns the correct plan_id in the response", async () => {
    const res = await GET(makeRequest(seededPlanId));
    const body = await res.json();

    expect(body.data.plan_id).toBe(seededPlanId);
  });

  it("returns pricing details in the response", async () => {
    const res = await GET(makeRequest(seededPlanId));
    const body = await res.json();

    expect(body.data.pricing.monthly_price).toBe(49);
    expect(body.data.pricing.annual_price).toBe(490);
  });

  it("does not return another plan when a different plan_id is queried", async () => {
    await SubscriptionPlan.create({
      name: "Gallery",
      benefits: { artworks: 50, exhibitions: 3 },
      pricing: { monthly_price: 99, annual_price: 990 },
      currency: "USD",
    });

    const res = await GET(makeRequest(seededPlanId));
    const body = await res.json();

    expect(body.data.name).toBe("Foundation");
  });
});

describe("GET /api/subscriptions/retrieveSinglePlan — not found / validation", () => {
  it("returns 500 when no plan matches the given plan_id", async () => {
    const res = await GET(makeRequest("nonexistent-plan-id"));

    expect(res.status).toBe(500);
  });

  it("returns 400 when plan_id query param is missing", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(400);
  });
});
