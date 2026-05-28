/**
 * Integration tests for POST /api/stripe/createCheckoutSession
 *
 * Verifies the route's feature-flag gate, DB validation (gallery + active
 * subscription required), and successful Stripe checkout session creation.
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

import { POST } from "../../../app/api/stripe/createCheckoutSession/route";

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

function makeCheckoutBody(overrides: Record<string, any> = {}) {
  return {
    item: "Artwork Title",
    amount: 500,
    seller_id: "gallery-001",
    meta: {
      buyer_email: "buyer@test.com",
      unit_price: 500,
      shipping_cost: 20,
      tax_fees: 10,
    },
    success_url: "https://app.omenai.com/order/success",
    cancel_url: "https://app.omenai.com/order/cancel",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createCheckoutSession", {
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

describe("POST /api/stripe/createCheckoutSession — feature flag disabled", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(false);
  });

  it("returns 503 when stripe_payment_enabled feature flag is false", async () => {
    const res = await POST(makeRequest(makeCheckoutBody()));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toMatch(/disabled/i);
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/stripe/createCheckoutSession — validation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when item is missing", async () => {
    const res = await POST(makeRequest(makeCheckoutBody({ item: undefined })));
    const body = await res.json();

    expect(res.status).toBe(400);
  });
});

// ── Gallery / subscription guard ─────────────────────────────────────────────

describe("POST /api/stripe/createCheckoutSession — DB guard", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 403 when no gallery with the given seller_id exists", async () => {
    const res = await POST(
      makeRequest(makeCheckoutBody({ seller_id: "nonexistent-gallery" })),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toMatch(/Cannot proceed/i);
  });

  it("returns 403 when gallery exists but has no active subscription", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );

    const res = await POST(makeRequest(makeCheckoutBody({ seller_id: "gallery-001" })));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toMatch(/Cannot proceed/i);
  });

  it("returns 403 when subscription status is not active", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-001", email: "g@test.com", name: "Gallery" },
        status: "canceled",
      }),
    );

    const res = await POST(makeRequest(makeCheckoutBody({ seller_id: "gallery-001" })));
    const body = await res.json();

    expect(res.status).toBe(403);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/stripe/createCheckoutSession — success", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 200 with session url when gallery and active subscription exist", async () => {
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

    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/pay/cs_test_abc123",
      id: "cs_test_abc123",
    });

    const res = await POST(makeRequest(makeCheckoutBody({ seller_id: "gallery-001" })));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Checkout Session created... Redirecting");
    expect(body.url).toBe("https://checkout.stripe.com/pay/cs_test_abc123");
  });

  it("calls stripe.checkout.sessions.create with correct line_items", async () => {
    await AccountGallery.create(
      makeGallery({ gallery_id: "gallery-001", connected_account_id: "acct_001" }),
    );
    await Subscriptions.create(
      makeSubscription({
        customer: { gallery_id: "gallery-001", email: "g@test.com", name: "Gallery" },
        status: "active",
      }),
    );

    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: "https://checkout.stripe.com/pay/cs_test_xyz",
      id: "cs_test_xyz",
    });

    await POST(
      makeRequest(
        makeCheckoutBody({
          seller_id: "gallery-001",
          item: "My Artwork",
          amount: 1000,
        }),
      ),
    );

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "usd",
              product_data: { name: "My Artwork" },
              unit_amount: 100000, // 1000 * 100
            }),
            quantity: 1,
          }),
        ]),
      }),
    );
  });
});
