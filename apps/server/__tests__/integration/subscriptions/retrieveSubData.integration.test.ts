/**
 * Integration tests for POST /api/subscriptions/retrieveSubData
 *
 * Seeds Subscriptions and SubscriptionPlan documents and verifies the route
 * returns the correct subscription with its matched plan.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";

import { POST } from "../../../app/api/subscriptions/retrieveSubData/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeSubscription(overrides: Record<string, any> = {}) {
  return {
    start_date: new Date(),
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentMethod: { id: "pm_test_001", type: "card" },
    stripe_customer_id: "cus_test_001",
    customer: { gallery_id: "gallery-001", email: "gallery@test.com", name: "Test Gallery" },
    status: "active",
    plan_details: { type: "Foundation", interval: "monthly" },
    next_charge_params: { value: 49, currency: "usd" },
    upload_tracker: { used: 5, limit: 20 },
    ...overrides,
  };
}

function makePlan(overrides: Record<string, any> = {}) {
  return {
    name: "Foundation",
    benefits: { artworks: 20, exhibitions: 1 },
    pricing: { monthly_price: 49, annual_price: 490 },
    currency: "USD",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/retrieveSubData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Promise.all([
    Subscriptions.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
  ]);
});

// ── Retrieval ─────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/retrieveSubData — retrieval", () => {
  beforeEach(async () => {
    await Promise.all([
      Subscriptions.create(makeSubscription()),
      SubscriptionPlan.create([
        makePlan({ name: "Foundation" }),
        makePlan({ name: "Gallery", pricing: { monthly_price: 99, annual_price: 990 } }),
      ]),
    ]);
  });

  it("returns 200 with the subscription data", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successfully retrieved subscription data");
    expect(body.data).not.toBeNull();
    expect(body.data.status).toBe("active");
  });

  it("matches the subscription to the correct plan by plan type", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(body.plan).not.toBeNull();
    expect(body.plan.name).toBe("Foundation");
    expect(body.plan.pricing.monthly_price).toBe(49);
  });

  it("returns null plan when subscription plan type does not match any stored plan", async () => {
    await Subscriptions.updateOne(
      { "customer.gallery_id": "gallery-001" },
      { $set: { plan_details: { type: "Premium" } } },
    );

    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.plan).toBeNull();
  });

  it("queries subscription by customer.gallery_id", async () => {
    // Second gallery with different subscription
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-002", email: "g2@test.com", name: "G2" },
        status: "expired",
        plan_details: { type: "Gallery", interval: "monthly" },
      }),
    );

    const res = await POST(makeRequest({ gallery_id: "gallery-002" }));
    const body = await res.json();

    expect(body.data.status).toBe("expired");
    expect(body.plan.name).toBe("Gallery");
  });
});

describe("POST /api/subscriptions/retrieveSubData — no subscription", () => {
  it("returns 200 with null data when gallery has no subscription", async () => {
    const res = await POST(makeRequest({ gallery_id: "new-gallery" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("No subscription data found");
    expect(body.data).toBeNull();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/retrieveSubData — validation", () => {
  it("returns 400 when gallery_id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
