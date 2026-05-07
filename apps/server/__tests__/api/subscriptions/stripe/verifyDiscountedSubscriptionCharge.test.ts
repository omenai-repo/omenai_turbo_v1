import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  SubscriptionPlan: { findOne: vi.fn() },
  Subscriptions: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn(), updateOne: vi.fn() },
}));

vi.mock(
  "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema",
  () => ({
    SubscriptionTransactions: {
      exists: vi.fn(),
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    setupIntents: { retrieve: vi.fn() },
    paymentMethods: { retrieve: vi.fn() },
  },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock(
  "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail",
  () => ({
    sendSubscriptionPaymentSuccessfulMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/getSubscriptionExpiryDate", () => ({
  getSubscriptionExpiryDate: vi.fn().mockReturnValue(new Date("2026-08-01")),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/uploadLimitUtility", () => ({
  getUploadLimitLookup: vi.fn().mockReturnValue(20),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/subscriptions/stripe/verifyDiscountedSubscriptionCharge/route";
import { SubscriptionPlan, Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

/* ----------------------------- Mock data ---------------------------------- */

const mockSetupIntent = {
  id: "seti_123",
  status: "succeeded",
  payment_method: "pm_abc",
};

const mockPaymentMethod = {
  id: "pm_abc",
  type: "card",
  customer: "cus_gallery_001",
};

const mockPlan = {
  plan_id: "plan-001",
  name: "Foundation",
  pricing: { monthly_price: "49", annual_price: "490" },
  currency: "USD",
};

const mockAccount = {
  name: "Test Gallery",
  email: "gallery@test.com",
  gallery_id: "gallery-001",
  stripe_customer_id: null,
};

function makeSessionWithPlan(planResult: any, accountResult: any) {
  const sessionMock = {
    withTransaction: vi.fn().mockImplementation(async (fn: any) => fn()),
    endSession: vi.fn(),
  };

  vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
    session: vi.fn().mockResolvedValue(planResult),
  } as any);

  vi.mocked(Subscriptions.findOne).mockReturnValue({
    session: vi.fn().mockResolvedValue(null), // no existing subscription
  } as any);

  vi.mocked(AccountGallery.findOne)
    .mockReturnValueOnce({ session: vi.fn().mockResolvedValue(accountResult) } as any)
    .mockResolvedValueOnce(accountResult as any); // second call for email

  vi.mocked(SubscriptionTransactions.create).mockResolvedValue([{}] as any);
  vi.mocked(Subscriptions.create).mockResolvedValue([{}] as any);
  vi.mocked(AccountGallery.updateOne).mockReturnValue({
    session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  } as any);
  vi.mocked(Waitlist.updateOne).mockReturnValue({
    session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  } as any);

  const clientMock = { startSession: vi.fn().mockResolvedValue(sessionMock) };
  vi.mocked(connectMongoDB).mockResolvedValue(clientMock as any);

  return sessionMock;
}

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/subscriptions/stripe/verifyDiscountedSubscriptionCharge",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const validBody = {
  setupIntentId: "seti_123",
  galleryId: "gallery-001",
  planId: "plan-001",
};

describe("POST /api/subscriptions/stripe/verifyDiscountedSubscriptionCharge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(stripe.setupIntents.retrieve).mockResolvedValue(mockSetupIntent as any);
    vi.mocked(stripe.paymentMethods.retrieve).mockResolvedValue(
      mockPaymentMethod as any,
    );
    vi.mocked(SubscriptionTransactions.exists).mockResolvedValue(null);
    makeSessionWithPlan(mockPlan, mockAccount);
  });

  it("returns 503 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toMatch(/disabled/i);
  });

  it("returns 400 when setup intent status is not succeeded", async () => {
    vi.mocked(stripe.setupIntents.retrieve).mockResolvedValueOnce({
      ...mockSetupIntent,
      status: "requires_payment_method",
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/problem adding your payment method/i);
  });

  it("returns 400 when setup intent has no payment method", async () => {
    vi.mocked(stripe.setupIntents.retrieve).mockResolvedValueOnce({
      ...mockSetupIntent,
      payment_method: null,
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/No payment method found/i);
  });

  it("returns 400 when payment method customer is not a string", async () => {
    vi.mocked(stripe.paymentMethods.retrieve).mockResolvedValueOnce({
      ...mockPaymentMethod,
      customer: { id: "cus_obj" }, // object, not string
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Invalid Stripe customer/i);
  });

  it("returns 200 when subscription already verified (idempotency)", async () => {
    vi.mocked(SubscriptionTransactions.exists).mockResolvedValueOnce(
      { _id: "txn-existing" } as any,
    );

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Subscription already verified");
  });

  it("returns 200 on successful discount subscription creation", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Subscription verified successfully");
  });

  it("creates subscription transaction with zero amount (discount)", async () => {
    await POST(makeRequest(validBody));

    expect(SubscriptionTransactions.create).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ amount: 0, status: "successful" })]),
      expect.any(Object),
    );
  });

  it("creates subscription record linked to gallery", async () => {
    await POST(makeRequest(validBody));

    expect(Subscriptions.create).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          status: "active",
          customer: expect.objectContaining({ gallery_id: "gallery-001" }),
        }),
      ]),
      expect.any(Object),
    );
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ setupIntentId: "seti_123" }));

    expect(response.status).toBe(400);
  });

  it("ends session in finally block", async () => {
    const session = makeSessionWithPlan(mockPlan, mockAccount);
    await POST(makeRequest(validBody));

    expect(session.endSession).toHaveBeenCalled();
  });
});
