/**
 * Integration tests for POST /api/subscriptions/updateSubscriptionPlan
 *
 * Seeds Subscriptions documents and verifies the route correctly updates the
 * next_charge_params and status fields in the real in-memory MongoDB.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockFetchConfigCatValue } = vi.hoisted(() => ({
  mockFetchConfigCatValue: vi.fn(),
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: mockFetchConfigCatValue,
}));

import { POST } from "../../../app/api/subscriptions/updateSubscriptionPlan/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

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

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/subscriptions/updateSubscriptionPlan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.clearAllMocks();
  await Subscriptions.deleteMany({});
});

// ── Feature flag disabled ─────────────────────────────────────────────────────

describe("POST /api/subscriptions/updateSubscriptionPlan — feature flag disabled", () => {
  it("returns 503 when subscription feature is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);
    await Subscriptions.create(makeSubscription());

    const res = await POST(makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: {} }));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toMatch(/disabled/i);
  });

  it("does not modify subscription when feature is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);
    await Subscriptions.create(makeSubscription({ next_charge_params: { value: 49, currency: "usd" } }));

    await POST(makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: { value: 99 } }));

    const sub = await Subscriptions.findOne({ "customer.gallery_id": "gallery-001" });
    expect(sub!.next_charge_params.value).toBe(49);
  });
});

// ── Plan update ───────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/updateSubscriptionPlan — plan update", () => {
  beforeEach(async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);
    await Subscriptions.create(makeSubscription({ status: "active" }));
  });

  it("returns 200 when plan is updated successfully", async () => {
    const res = await POST(
      makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: { value: 99 } }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successful");
  });

  it("stores the new next_charge_params in the database", async () => {
    const newData = { value: 99, currency: "usd", plan_id: "plan-gallery" };
    await POST(makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: newData }));

    const sub = await Subscriptions.findOne({ "customer.gallery_id": "gallery-001" });
    expect(sub!.next_charge_params).toMatchObject(newData);
  });

  it("sets status to active on reactivation action", async () => {
    await Subscriptions.updateOne(
      { "customer.gallery_id": "gallery-001" },
      { $set: { status: "canceled" } },
    );

    await POST(makeRequest({ gallery_id: "gallery-001", action: "reactivation", data: {} }));

    const sub = await Subscriptions.findOne({ "customer.gallery_id": "gallery-001" });
    expect(sub!.status).toBe("active");
  });

  it("preserves current status for non-reactivation upgrade action", async () => {
    await POST(makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: {} }));

    const sub = await Subscriptions.findOne({ "customer.gallery_id": "gallery-001" });
    expect(sub!.status).toBe("active");
  });

  it("only updates the targeted gallery's subscription", async () => {
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-002", email: "g2@test.com", name: "G2" },
        next_charge_params: { value: 49, currency: "usd" },
      }),
    );

    await POST(makeRequest({ gallery_id: "gallery-001", action: "upgrade", data: { value: 99 } }));

    const g2 = await Subscriptions.findOne({ "customer.gallery_id": "gallery-002" });
    expect(g2!.next_charge_params.value).toBe(49);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/updateSubscriptionPlan — validation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const res = await POST(makeRequest({ action: "upgrade", data: {} }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when action is missing", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-001", data: {} }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when data field is missing", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-001", action: "upgrade" }));

    expect(res.status).toBe(400);
  });
});
