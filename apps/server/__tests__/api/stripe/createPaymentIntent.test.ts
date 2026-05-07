import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    paymentIntents: { create: vi.fn() },
  },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/subscriptions/SubscriptionSchema", () => ({
  Subscriptions: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/stripe/createPaymentIntent/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const mockGallery = { connected_account_id: "acct_gallery_123" };
const mockSubscriptionActive = {
  plan_details: { type: "Foundation" },
  status: "active",
};
const mockPaymentIntent = {
  id: "pi_abc123",
  client_secret: "pi_abc123_secret_xyz",
};

const validBody = {
  amount: 1050,
  seller_id: "gallery-001",
  meta: { unit_price: 1000, shipping_cost: 30, tax_fees: 20, buyer_email: "buyer@test.com", art_id: "art-1" },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/createPaymentIntent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockGalleryAndSubscription(gallery: any, subscription: any) {
  vi.mocked(AccountGallery.findOne).mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(gallery) }),
  } as any);
  vi.mocked(Subscriptions.findOne).mockReturnValue({
    select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(subscription) }),
  } as any);
}

describe("POST /api/stripe/createPaymentIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    mockGalleryAndSubscription(mockGallery, mockSubscriptionActive);
    vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockPaymentIntent as any);
    process.env.NEXT_PUBLIC_STRIPE_PK = "pk_test_abc";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_STRIPE_PK;
  });

  it("returns 200 with paymentIntent, publishableKey, and paymentIntentId", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.paymentIntent).toBe(mockPaymentIntent.client_secret);
    expect(body.paymentIntentId).toBe(mockPaymentIntent.id);
    expect(body.publishableKey).toBe("pk_test_abc");
  });

  it("creates payment intent in cents with correct amount", async () => {
    await POST(makeRequest(validBody));

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: Math.round(validBody.amount * 100),
        currency: "usd",
      }),
    );
  });

  it("applies foundation commission rate (25%) for Foundation plan", async () => {
    await POST(makeRequest(validBody));

    const expectedCommission = Math.round((1000 * 0.25 + 30 + 20) * 100);
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        application_fee_amount: expectedCommission,
        transfer_data: { destination: mockGallery.connected_account_id },
      }),
    );
  });

  it("applies gallery commission rate (20%) for Gallery plan", async () => {
    mockGalleryAndSubscription(
      mockGallery,
      { plan_details: { type: "Gallery" }, status: "active" },
    );

    await POST(makeRequest(validBody));

    const expectedCommission = Math.round((1000 * 0.2 + 30 + 20) * 100);
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ application_fee_amount: expectedCommission }),
    );
  });

  it("applies principal commission rate (15%) for Principal plan", async () => {
    mockGalleryAndSubscription(
      mockGallery,
      { plan_details: { type: "Principal" }, status: "active" },
    );

    await POST(makeRequest(validBody));

    const expectedCommission = Math.round((1000 * 0.15 + 30 + 20) * 100);
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ application_fee_amount: expectedCommission }),
    );
  });

  it("applies premium commission rate (10%) for unit_price >= $10,000", async () => {
    const highValueBody = {
      ...validBody,
      amount: 10050,
      meta: { ...validBody.meta, unit_price: 10000 },
    };

    await POST(makeRequest(highValueBody));

    const expectedCommission = Math.round((10000 * 0.1 + 30 + 20) * 100);
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ application_fee_amount: expectedCommission }),
    );
  });

  it("enables automatic payment methods", async () => {
    await POST(makeRequest(validBody));

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        automatic_payment_methods: { enabled: true },
      }),
    );
  });

  it("returns 503 when stripe payment feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(503);
  });

  it("returns 403 when gallery is not found", async () => {
    mockGalleryAndSubscription(null, mockSubscriptionActive);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(403);
  });

  it("returns 403 when subscription is not active", async () => {
    mockGalleryAndSubscription(mockGallery, {
      plan_details: { type: "Foundation" },
      status: "expired",
    });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(403);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ seller_id: "gallery-001", meta: {} }));

    expect(response.status).toBe(400);
  });

  it("returns 500 when stripe.paymentIntents.create throws", async () => {
    vi.mocked(stripe.paymentIntents.create).mockRejectedValueOnce(
      new Error("Card declined"),
    );

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
  });
});
