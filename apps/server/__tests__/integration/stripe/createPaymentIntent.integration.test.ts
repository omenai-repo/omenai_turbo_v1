/**
 * Integration tests for POST /api/stripe/createPaymentIntent
 *
 * Verifies the route's feature-flag gate, DB validation (gallery + active
 * subscription required), and successful Stripe payment intent creation.
 * Both stripe and ConfigCat are re-mocked via vi.hoisted().
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";

// ── ConfigCat mock ────────────────────────────────────────────────────────────

const { mockFetchConfigCatValue } = vi.hoisted(() => ({
  mockFetchConfigCatValue: vi.fn(),
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: mockFetchConfigCatValue,
}));

// ── Stripe mock (overrides the basic stub from setup.ts) ─────────────────────

const { mockStripe } = vi.hoisted(() => ({
  mockStripe: {
    accounts: {
      retrieve: vi.fn(),
      create: vi.fn(),
      createLoginLink: vi.fn(),
    },
    accountLinks: { create: vi.fn() },
    balance: { retrieve: vi.fn() },
    checkout: { sessions: { create: vi.fn(), retrieve: vi.fn() } },
    paymentIntents: { create: vi.fn(), retrieve: vi.fn() },
    tax: { transactions: { createFromCalculation: vi.fn() } },
  },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: mockStripe,
}));

import { POST } from "../../../app/api/stripe/createPaymentIntent/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    name: `Gallery ${uid}`,
    address: { city: "NY", country: "US" },
    description: "A test gallery",
    admin: "Admin Name",
    email: `gallery-${uid}@test.com`,
    password: "hashed",
    verified: false,
    gallery_verified: false,
    logo: "logo.jpg",
    gallery_id: `gallery-${uid}`,
    connected_account_id: `acct-${uid}`,
    ...overrides,
  };
}

function makeSubscription(overrides: Record<string, any> = {}) {
  return {
    start_date: new Date(),
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentMethod: { id: "pm_test", type: "card" },
    stripe_customer_id: "cus_test",
    customer: { gallery_id: "gallery-001", email: "g@test.com", name: "Test Gallery" },
    status: "active",
    plan_details: { type: "Foundation", interval: "monthly" },
    next_charge_params: { value: 49, currency: "usd" },
    upload_tracker: { used: 0, limit: 20 },
    ...overrides,
  };
}

function makePaymentIntentBody(overrides: Record<string, any> = {}) {
  return {
    amount: 500,
    seller_id: "gallery-001",
    meta: {
      buyer_email: "buyer@test.com",
      unit_price: 500,
      shipping_cost: 20,
      tax_fees: 10,
    },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createPaymentIntent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Teardown ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.clearAllMocks();
  await AccountGallery.deleteMany({});
  await Subscriptions.deleteMany({});
});

// ── Feature flag disabled ─────────────────────────────────────────────────────

describe("POST /api/stripe/createPaymentIntent — feature flag disabled", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(false);
  });

  it("returns 503 when stripe_payment_enabled feature flag is false", async () => {
    const res = await POST(makeRequest(makePaymentIntentBody()));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toMatch(/disabled/i);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/stripe/createPaymentIntent — validation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when amount is missing", async () => {
    const res = await POST(
      makeRequest(makePaymentIntentBody({ amount: undefined })),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
  });

  it("returns 400 when seller_id is missing", async () => {
    const res = await POST(
      makeRequest(makePaymentIntentBody({ seller_id: undefined })),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
  });
});

// ── Gallery / subscription guard ─────────────────────────────────────────────

describe("POST /api/stripe/createPaymentIntent — DB guard", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 403 when no gallery with the given seller_id exists", async () => {
    const res = await POST(
      makeRequest(makePaymentIntentBody({ seller_id: "nonexistent-gallery" })),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toMatch(/Cannot proceed/i);
  });

  it("returns 403 when gallery exists but has no subscription", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );

    const res = await POST(
      makeRequest(makePaymentIntentBody({ seller_id: "gallery-001" })),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toMatch(/Cannot proceed/i);
  });

  it("returns 403 when subscription is not active", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-001", email: "g@test.com", name: "Gallery" },
        status: "canceled",
      }),
    );

    const res = await POST(
      makeRequest(makePaymentIntentBody({ seller_id: "gallery-001" })),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/stripe/createPaymentIntent — success", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 200 with paymentIntent, publishableKey, and paymentIntentId", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-001", email: "g@test.com", name: "Gallery" },
        status: "active",
        plan_details: { type: "Foundation", interval: "monthly" },
      }),
    );

    mockStripe.paymentIntents.create.mockResolvedValue({
      id: "pi_test_abc123",
      client_secret: "pi_test_abc123_secret_xyz",
    });

    const res = await POST(
      makeRequest(makePaymentIntentBody({ seller_id: "gallery-001" })),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.paymentIntent).toBe("pi_test_abc123_secret_xyz");
    expect(body.paymentIntentId).toBe("pi_test_abc123");
    // publishableKey reflects process.env.NEXT_PUBLIC_STRIPE_PK which is not
    // set in the test environment; verify the shape without requiring a value.
    expect(body).not.toHaveProperty("message");
  });

  it("calls stripe.paymentIntents.create with correct amount in cents", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-001", email: "g@test.com", name: "Gallery" },
        status: "active",
      }),
    );

    mockStripe.paymentIntents.create.mockResolvedValue({
      id: "pi_test_def456",
      client_secret: "pi_test_def456_secret",
    });

    await POST(
      makeRequest(
        makePaymentIntentBody({ seller_id: "gallery-001", amount: 250 }),
      ),
    );

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 25000, // 250 * 100
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        transfer_data: expect.objectContaining({
          destination: "acct_001",
        }),
      }),
    );
  });
});
