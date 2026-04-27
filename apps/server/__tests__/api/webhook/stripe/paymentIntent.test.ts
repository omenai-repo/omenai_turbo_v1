import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    paymentIntents: { retrieve: vi.fn() },
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/transactions/PurchaseTransactionSchema",
  () => ({
    PurchaseTransactions: { exists: vi.fn(), updateOne: vi.fn() },
  }),
);

vi.mock(
  "@omenai/shared-models/models/transactions/PaymentLedgerShema",
  () => ({
    PaymentLedger: {
      exists: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema",
  () => ({
    SubscriptionTransactions: {
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-models/models/subscriptions", () => ({
  SubscriptionPlan: { findOne: vi.fn() },
  Subscriptions: { findOne: vi.fn(), updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: { updateOne: vi.fn() },
}));

vi.mock(
  "@omenai/shared-models/models/device_management/DeviceManagementSchema",
  () => ({
    DeviceManagement: { findOne: vi.fn() },
  }),
);

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-services/orders/releaseOrderLock", () => ({
  releaseOrderLock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail",
  () => ({
    sendPaymentFailedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentPendingMail",
  () => ({
    sendPaymentPendingMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail",
  () => ({
    sendSubscriptionPaymentSuccessfulMail: vi.fn().mockResolvedValue(undefined),
  }),
);

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

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn((p: number) => `$${p}`),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/getCurrencySymbol", () => ({
  getCurrencySymbol: vi.fn().mockReturnValue("$"),
}));

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue(1234),
}));

vi.mock("@omenai/shared-utils/src/getCurrentDateTime", () => ({
  getFormattedDateTime: vi.fn().mockReturnValue("2025-01-01T00:00:00Z"),
}));

vi.mock("@omenai/shared-utils/src/getCurrentMonthAndYear", () => ({
  getCurrentMonthAndYear: vi.fn().mockReturnValue({ month: 1, year: 2025 }),
}));

vi.mock("@omenai/shared-utils/src/getSubscriptionExpiryDate", () => ({
  getSubscriptionExpiryDate: vi.fn().mockReturnValue(new Date("2025-02-01")),
}));

vi.mock("@omenai/shared-utils/src/uploadLimitUtility", () => ({
  getUploadLimitLookup: vi.fn().mockReturnValue(50),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  record_tax_transaction: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../../../../app/api/webhook/stripe/paymentIntent/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { SubscriptionPlan, Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { sendPaymentPendingMail } from "@omenai/shared-emails/src/models/payment/sendPaymentPendingMail";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { sendSubscriptionPaymentPendingMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentPendingMail";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";

const mockSession = {
  startTransaction: vi.fn(),
  commitTransaction: vi.fn().mockResolvedValue(undefined),
  abortTransaction: vi.fn().mockResolvedValue(undefined),
  endSession: vi.fn().mockResolvedValue(undefined),
  inTransaction: vi.fn().mockReturnValue(false),
};

const purchaseMeta = {
  type: "purchase",
  buyer_email: "buyer@test.com",
  art_id: "art-1",
  buyer_id: "buyer-1",
  unit_price: "500",
  shipping_cost: "20",
  tax_fees: "10",
  commission: "50",
};

const subscriptionMeta = {
  type: "subscription",
  gallery_id: "gallery-1",
  plan_id: "plan-1",
  planInterval: "monthly",
  name: "Gallery Name",
  email: "gallery@test.com",
  customer: "cus_test_123",
};

const basePurchasePI = {
  id: "pi_test_123",
  status: "succeeded",
  amount: 53000,
  amount_received: 53000,
  currency: "usd",
  metadata: purchaseMeta,
  customer: null,
};

const baseSubscriptionPI = {
  id: "pi_sub_123",
  status: "succeeded",
  amount: 10000,
  amount_received: 10000,
  currency: "usd",
  metadata: subscriptionMeta,
  customer: "cus_test_123",
};

const baseOrder = {
  order_id: "order-001",
  buyer_details: { id: "buyer-1", email: "buyer@test.com", name: "John" },
  seller_details: { id: "seller-1", email: "seller@test.com", name: "Jane" },
  seller_designation: "gallery",
  artwork_data: {
    title: "Art Work",
    art_id: "art-1",
    url: "https://img.test/art.jpg",
    artist: "Jane Artist",
    pricing: { usd_price: 500 },
  },
  shipping_details: {
    addresses: {
      destination: {
        address_line: "1 Dest St",
        city: "Berlin",
        country: "DE",
        countryCode: "DE",
        zip: "10115",
      },
    },
    shipment_information: { quote: { tax_calculation_id: "tax-calc-1" } },
  },
  payment_information: null,
  createdAt: "2025-01-01T00:00:00.000Z",
};

function makeRequest(
  eventType: string,
  piOverrides: Partial<typeof basePurchasePI> = {},
): Request {
  return new Request("http://localhost/api/webhook/stripe/paymentIntent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": "valid-sig",
    },
    body: JSON.stringify({}),
  });
}

function setupPurchaseEvent(
  eventType: string,
  piOverrides: Partial<typeof basePurchasePI> = {},
) {
  const pi = { ...basePurchasePI, ...piOverrides };
  vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
    type: eventType,
    data: { object: { id: pi.id } },
  } as any);
  vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(pi as any);
}

function setupSubscriptionEvent(
  eventType: string,
  piOverrides: Partial<typeof baseSubscriptionPI> = {},
) {
  const pi = { ...baseSubscriptionPI, ...piOverrides };
  vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
    type: eventType,
    data: { object: { id: pi.id } },
  } as any);
  vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(pi as any);
}

describe("POST /api/webhook/stripe/paymentIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_PAYMENT_INTENT_WEBHOOK_SECRET", "test-pi-secret");

    vi.mocked(connectMongoDB).mockResolvedValue({
      startSession: vi.fn().mockReturnValue(mockSession),
    } as any);

    setupPurchaseEvent("payment_intent.succeeded");

    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(baseOrder),
    } as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);

    vi.mocked(PurchaseTransactions.exists).mockResolvedValue(null);
    vi.mocked(PurchaseTransactions.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);

    vi.mocked(PaymentLedger.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 1,
    } as any);

    vi.mocked(SubscriptionTransactions.findOne).mockResolvedValue(null);
    vi.mocked(SubscriptionTransactions.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(SubscriptionTransactions.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);

    vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({
        name: "premium",
        plan_id: "plan-1",
        pricing: { monthly_price: "100", annual_price: "1000" },
        currency: "USD",
      }),
    } as any);

    vi.mocked(Subscriptions.findOne).mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    } as any);
    vi.mocked(Subscriptions.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);

    vi.mocked(AccountGallery.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    vi.mocked(Waitlist.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);

    vi.mocked(DeviceManagement.findOne).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  /* ----------------------------- Verification ----------------------------- */

  it("returns 500 when webhook secret is not configured", async () => {
    vi.stubEnv("STRIPE_PAYMENT_INTENT_WEBHOOK_SECRET", "");

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(500);
  });

  it("returns 500 when stripe-signature header is missing", async () => {
    const req = new Request("http://localhost/api/webhook/stripe/paymentIntent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
  });

  it("returns 500 when constructEvent throws (bad signature)", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("No signatures found");
    });

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(500);
  });

  it("returns 200 for unsupported event types", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "customer.created",
      data: { object: { id: "pi_test_123" } },
    } as any);

    const response = await POST(makeRequest("customer.created"));

    expect(response.status).toBe(200);
    expect(CreateOrder.findOne).not.toHaveBeenCalled();
  });

  it("returns 200 when payment intent has no metadata type", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_123" } },
    } as any);
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
      ...basePurchasePI,
      metadata: {},
    } as any);

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(200);
    expect(CreateOrder.findOne).not.toHaveBeenCalled();
  });

  /* ----------------------------- Purchase: processing / failed ------------ */

  it("PURCHASE_PROCESSING: sends pending mail and returns 200", async () => {
    setupPurchaseEvent("payment_intent.processing");

    const response = await POST(makeRequest("payment_intent.processing"));

    expect(response.status).toBe(200);
    expect(sendPaymentPendingMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@test.com" }),
    );
  });

  it("PURCHASE_PROCESSING: returns status 400 in body when order is not found", async () => {
    setupPurchaseEvent("payment_intent.processing");
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest("payment_intent.processing"));
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("PURCHASE_FAILED: sends failed mail and returns 200", async () => {
    setupPurchaseEvent("payment_intent.payment_failed");

    const response = await POST(makeRequest("payment_intent.payment_failed"));

    expect(response.status).toBe(200);
    expect(sendPaymentFailedMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@test.com" }),
    );
  });

  /* ----------------------------- Purchase: succeeded ---------------------- */

  it("PURCHASE_SUCCEEDED: returns status 400 in body when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest("payment_intent.succeeded"));
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("PURCHASE_SUCCEEDED: returns 200 on idempotency (existing transaction)", async () => {
    vi.mocked(PurchaseTransactions.exists).mockResolvedValue("exists" as any);

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("PURCHASE_SUCCEEDED: returns status 500 in body when payment ledger write fails", async () => {
    vi.mocked(PaymentLedger.updateOne).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest("payment_intent.succeeded"));
    const body = await response.json();

    expect(body.status).toBe(500);
  });

  it("PURCHASE_SUCCEEDED: returns 200 when ledger upsert is a duplicate", async () => {
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 0,
    } as any);

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(200);
    expect(CreateOrder.updateOne).not.toHaveBeenCalled();
  });

  it("PURCHASE_SUCCEEDED: returns 400 when order update has no effect", async () => {
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(400);
  });

  it("PURCHASE_SUCCEEDED: triggers workflows, releases lock, and returns 200", async () => {
    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(200);
    expect(CreateOrder.updateOne).toHaveBeenCalledWith(
      { order_id: "order-001" },
      expect.objectContaining({
        $set: expect.objectContaining({
          payment_information: expect.objectContaining({ status: "completed" }),
        }),
      }),
    );
    expect(createWorkflow).toHaveBeenCalledWith(
      expect.stringContaining("/api/workflows/shipment/create_shipment"),
      expect.any(String),
      expect.any(String),
    );
    expect(releaseOrderLock).toHaveBeenCalledWith("art-1", "buyer-1");
  });

  /* ----------------------------- Subscription: processing / failed -------- */

  it("SUBSCRIPTION_PROCESSING: updates status and sends pending mail", async () => {
    setupSubscriptionEvent("payment_intent.processing");

    const response = await POST(makeRequest("payment_intent.processing"));

    expect(response.status).toBe(200);
    expect(sendSubscriptionPaymentPendingMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "gallery@test.com" }),
    );
  });

  it("SUBSCRIPTION_FAILED: updates status and sends failure mail", async () => {
    setupSubscriptionEvent("payment_intent.payment_failed");

    const response = await POST(makeRequest("payment_intent.payment_failed"));

    expect(response.status).toBe(200);
    expect(sendSubscriptionPaymentFailedMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "gallery@test.com" }),
    );
  });

  /* ----------------------------- Subscription: succeeded ------------------ */

  it("SUBSCRIPTION_SUCCEEDED: returns 200 on idempotency", async () => {
    setupSubscriptionEvent("payment_intent.succeeded");
    vi.mocked(SubscriptionTransactions.findOne).mockResolvedValue({
      payment_ref: "pi_sub_123",
      status: "successful",
      stripe_customer_id: "cus_test_123",
    } as any);

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(200);
    expect(SubscriptionPlan.findOne).not.toHaveBeenCalled();
  });

  it("SUBSCRIPTION_SUCCEEDED: persists subscription and sends success mail", async () => {
    setupSubscriptionEvent("payment_intent.succeeded");

    const response = await POST(makeRequest("payment_intent.succeeded"));

    expect(response.status).toBe(200);
    expect(SubscriptionTransactions.findOneAndUpdate).toHaveBeenCalled();
    expect(Subscriptions.updateOne).toHaveBeenCalled();
    expect(AccountGallery.updateOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      expect.objectContaining({
        $set: expect.objectContaining({ subscription_status: expect.any(Object) }),
      }),
      expect.any(Object),
    );
    expect(sendSubscriptionPaymentSuccessfulMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "gallery@test.com" }),
    );
    expect(mockSession.commitTransaction).toHaveBeenCalled();
  });

  it("SUBSCRIPTION_SUCCEEDED: aborts transaction and returns status 500 in body on DB error", async () => {
    setupSubscriptionEvent("payment_intent.succeeded");
    vi.mocked(SubscriptionPlan.findOne).mockReturnValue({
      session: vi.fn().mockRejectedValue(new Error("DB read failed")),
    } as any);
    vi.mocked(mockSession.inTransaction).mockReturnValue(true);

    const response = await POST(makeRequest("payment_intent.succeeded"));
    const body = await response.json();

    expect(body.status).toBe(500);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });
});
