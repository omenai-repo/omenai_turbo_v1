/**
 * Integration tests for POST /api/subscriptions/createPlan
 *
 * Tests plan creation against the real in-memory MongoDB instance, verifying
 * that SubscriptionPlan documents are persisted with correct fields.
 */

import { describe, it, expect, afterEach } from "vitest";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";

import { POST } from "../../../app/api/subscriptions/createPlan/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/createPlan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPlanBody = {
  name: "Foundation",
  benefits: { artworks: 20, exhibitions: 1 },
  pricing: { monthly_price: 49, annual_price: 490 },
  currency: "USD",
};

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SubscriptionPlan.deleteMany({});
});

// ── Creation ──────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/createPlan — creation", () => {
  it("returns 200 and persists the plan document", async () => {
    const res = await POST(makeRequest(validPlanBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Plan created successfully");

    const plan = await SubscriptionPlan.findOne({ name: "Foundation" });
    expect(plan).not.toBeNull();
    expect(plan!.name).toBe("Foundation");
  });

  it("auto-generates a plan_id on creation", async () => {
    await POST(makeRequest(validPlanBody));

    const plan = await SubscriptionPlan.findOne({ name: "Foundation" });
    expect(plan!.plan_id).toBeDefined();
    expect(typeof plan!.plan_id).toBe("string");
    expect(plan!.plan_id.length).toBeGreaterThan(0);
  });

  it("stores pricing details correctly", async () => {
    await POST(makeRequest(validPlanBody));

    const plan = await SubscriptionPlan.findOne({ name: "Foundation" });
    expect(plan!.pricing.monthly_price).toBe(49);
    expect(plan!.pricing.annual_price).toBe(490);
  });

  it("stores benefits details correctly", async () => {
    await POST(makeRequest(validPlanBody));

    const plan = await SubscriptionPlan.findOne({ name: "Foundation" });
    expect(plan!.benefits.artworks).toBe(20);
    expect(plan!.benefits.exhibitions).toBe(1);
  });

  it("stores the correct currency", async () => {
    await POST(makeRequest(validPlanBody));

    const plan = await SubscriptionPlan.findOne({ name: "Foundation" });
    expect(plan!.currency).toBe("USD");
  });

  it("creates exactly one plan document per request", async () => {
    await POST(makeRequest(validPlanBody));

    const count = await SubscriptionPlan.countDocuments({});
    expect(count).toBe(1);
  });

  it("can create multiple distinct plans", async () => {
    await POST(makeRequest(validPlanBody));
    await POST(makeRequest({ ...validPlanBody, name: "Gallery", pricing: { monthly_price: 99, annual_price: 990 } }));

    const count = await SubscriptionPlan.countDocuments({});
    expect(count).toBe(2);
  });
});

// ── Validation / errors ───────────────────────────────────────────────────────

describe("POST /api/subscriptions/createPlan — validation", () => {
  it("returns 500 when name is missing (Mongoose required field)", async () => {
    const { name: _, ...bodyWithoutName } = validPlanBody;
    const res = await POST(makeRequest(bodyWithoutName));

    // Route uses request.json() directly (no Zod) — Mongoose validates required fields
    expect(res.status).toBe(500);
  });

  it("returns 500 when pricing is missing (Mongoose required field)", async () => {
    const { pricing: _, ...bodyWithoutPricing } = validPlanBody;
    const res = await POST(makeRequest(bodyWithoutPricing));

    expect(res.status).toBe(500);
  });
});
