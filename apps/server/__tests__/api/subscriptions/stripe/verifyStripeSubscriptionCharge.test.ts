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

vi.mock("mongoose", () => ({
  default: { startSession: vi.fn() },
  ClientSession: class {},
}));

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  Subscriptions: {
    findOne: vi.fn(),
    create: vi.fn(),
    updateOne: vi.fn(),
  },
  SubscriptionPlan: {
    findOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema",
  () => ({
    SubscriptionTransactions: {
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    paymentIntents: { retrieve: vi.fn() },
  },
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: vi.fn().mockResolvedValue(true),
}));

vi.mock(
  "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail",
  () => ({
    sendSubscriptionPaymentFailedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentPendingMail",
  () => ({
    sendSubscriptionPaymentPendingMail: vi.fn().mockResolvedValue(undefined),
  }),
);

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

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/subscriptions/stripe/verifyStripeSubscriptionCharge/route";
import {
  Subscriptions,
  SubscriptionPlan,
} from "@omenai/shared-models/models/subscriptions";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { sendSubscriptionPaymentPendingMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentPendingMail";
import mongoose from "mongoose";

/* ----------------------------- Mock data ---------------------------------- */

const validMetadata = {
  name: "Test Gallery",
  email: "gallery@test.com",
  gallery_id: "gallery-001",
  plan_id: "plan-001",
  plan_interval: "monthly",
};

const mockPaymentIntent = {
  id: "pi_123",
  status: "succeeded",
  amount: 4900,
  currency: "usd",
  customer: "cus_gallery_001",
  payment_method: { id: "pm_card_visa", type: "card" },
  metadata: validMetadata,
};

const mockPlan = {
  plan_id: "plan-001",
  name: "Foundation",
  pricing: { monthly_price: "49", annual_price: "490" },
  currency: "USD",
};

function makeMongoSession() {
  const session = {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    abortTransaction: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn(),
  };
  vi.mocked(mongoose.startSession).mockResolvedValue(session as any);
  return session;
}

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/subscriptions/stripe/verifyStripeSubscriptionCharge",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/subscriptions/stripe/verifyStripeSubscriptionCharge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchConfigCatValue).mockResolvedValue(true);
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(mockPaymentIntent as any);
    vi.mocked(SubscriptionTransactions.findOne).mockReturnValue({
      lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }),
    } as any);
    vi.mocked(SubscriptionTransactions.findOneAndUpdate).mockResolvedValue({} as any);
    vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue(mockPlan),
    } as any);
    vi.mocked(Subscriptions.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    } as any);
    vi.mocked(Subscriptions.create).mockResolvedValue([{}] as any);
    vi.mocked(AccountGallery.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(Waitlist.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);
    makeMongoSession();
  });

  it("returns 403 when subscriptions feature is disabled", async () => {
    vi.mocked(fetchConfigCatValue).mockResolvedValueOnce(false);

    const response = await POST(makeRequest({ paymentIntentId: "pi_123" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/disabled/i);
  });

  it("returns 400 when paymentIntentId is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("returns 404 when PaymentIntent is not found in Stripe", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce(null as any);

    const response = await POST(makeRequest({ paymentIntentId: "pi_nonexistent" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("PaymentIntent not found");
  });

  it("returns 200 when existing transaction was already successful (idempotency)", async () => {
    vi.mocked(SubscriptionTransactions.findOne).mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ status: "successful" }),
      }),
    } as any);

    const response = await POST(makeRequest({ paymentIntentId: "pi_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Transaction processed successfully");
  });

  it("returns 200 with success message on succeeded payment", async () => {
    const response = await POST(makeRequest({ paymentIntentId: "pi_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment succeeded and processed");
  });

  it("returns 200 for processing payment status", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
      ...mockPaymentIntent,
      status: "processing",
    } as any);

    const response = await POST(makeRequest({ paymentIntentId: "pi_123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Payment is processing");
  });

  it("returns 400 for failed payment status", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
      ...mockPaymentIntent,
      status: "canceled",
    } as any);

    const response = await POST(makeRequest({ paymentIntentId: "pi_123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Payment failed");
  });

  it("sends success email on succeeded payment", async () => {
    await POST(makeRequest({ paymentIntentId: "pi_123" }));

    // email is fire-and-forget so allow a tick to run
    await new Promise((r) => setTimeout(r, 10));
    expect(sendSubscriptionPaymentSuccessfulMail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: validMetadata.name,
        email: validMetadata.email,
      }),
    );
  });

  it("sends pending email for processing payment", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
      ...mockPaymentIntent,
      status: "processing",
    } as any);

    await POST(makeRequest({ paymentIntentId: "pi_123" }));
    await new Promise((r) => setTimeout(r, 10));

    expect(sendSubscriptionPaymentPendingMail).toHaveBeenCalled();
  });

  it("sends failed email for canceled/failed payment", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
      ...mockPaymentIntent,
      status: "canceled",
    } as any);

    await POST(makeRequest({ paymentIntentId: "pi_123" }));
    await new Promise((r) => setTimeout(r, 10));

    expect(sendSubscriptionPaymentFailedMail).toHaveBeenCalled();
  });

  it("upserts subscription transaction record", async () => {
    await POST(makeRequest({ paymentIntentId: "pi_123" }));

    expect(SubscriptionTransactions.findOneAndUpdate).toHaveBeenCalledWith(
      { payment_ref: mockPaymentIntent.id },
      expect.objectContaining({ $set: expect.objectContaining({ gallery_id: "gallery-001" }) }),
      expect.objectContaining({ upsert: true }),
    );
  });

  it("ends mongo session in finally block", async () => {
    const session = makeMongoSession();
    await POST(makeRequest({ paymentIntentId: "pi_123" }));

    expect(session.endSession).toHaveBeenCalled();
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockRejectedValueOnce(
      new Error("Stripe network error"),
    );

    const response = await POST(makeRequest({ paymentIntentId: "pi_123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
