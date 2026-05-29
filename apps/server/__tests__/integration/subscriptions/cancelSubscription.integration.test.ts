/**
 * Integration tests for POST /api/subscriptions/cancelSubscription
 *
 * Seeds a Subscriptions document and verifies the route updates its status
 * to "canceled" in the real in-memory MongoDB instance. The ConfigCat feature
 * flag is controlled via vi.hoisted() so it can be overridden per test.
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

import { POST } from "../../../app/api/subscriptions/cancelSubscription/route";

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
  return new Request("http://localhost/api/subscriptions/cancelSubscription", {
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

describe("POST /api/subscriptions/cancelSubscription — feature flag disabled", () => {
  it("returns 403 when subscription feature is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);
    await Subscriptions.create(makeSubscription());

    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toMatch(/disabled/i);
  });

  it("does not modify subscription when feature is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);
    await Subscriptions.create(makeSubscription());

    await POST(makeRequest({ gallery_id: "gallery-001" }));

    const sub = await Subscriptions.findOne({ "customer.gallery_id": "gallery-001" });
    expect(sub!.status).toBe("active");
  });
});

// ── Cancellation ──────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/cancelSubscription — cancellation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 200 when subscription is successfully canceled", async () => {
    await Subscriptions.create(makeSubscription());

    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Subscription has been canceled");
  });

  it("updates subscription status to canceled in the database", async () => {
    await Subscriptions.create(makeSubscription({ status: "active" }));

    await POST(makeRequest({ gallery_id: "gallery-001" }));

    const updated = await Subscriptions.findOne({ "customer.gallery_id": "gallery-001" });
    expect(updated!.status).toBe("canceled");
  });

  it("only cancels the subscription for the specified gallery_id", async () => {
    await Subscriptions.create([
      makeSubscription({ customer: { gallery_id: "gallery-001", email: "g1@test.com", name: "G1" } }),
      makeSubscription({ customer: { gallery_id: "gallery-002", email: "g2@test.com", name: "G2" } }),
    ]);

    await POST(makeRequest({ gallery_id: "gallery-001" }));

    const g2 = await Subscriptions.findOne({ "customer.gallery_id": "gallery-002" });
    expect(g2!.status).toBe("active");
  });

  it("returns 200 even when no matching subscription exists (updateOne succeeds with 0 matches)", async () => {
    const res = await POST(makeRequest({ gallery_id: "nonexistent-gallery" }));

    expect(res.status).toBe(200);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/subscriptions/cancelSubscription — validation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 400 when gallery_id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
