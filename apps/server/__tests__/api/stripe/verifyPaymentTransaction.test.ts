import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/payments/stripe/stripe", () => ({
  stripe: {
    paymentIntents: { retrieve: vi.fn() },
    checkout: { sessions: { retrieve: vi.fn() } },
  },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/transactions/PaymentLedgerShema", () => ({
  PaymentLedger: {
    exists: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/transactions/PurchaseTransactionSchema",
  () => ({
    PurchaseTransactions: {
      exists: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/device_management/DeviceManagementSchema",
  () => ({
    DeviceManagement: {
      findOne: vi.fn().mockResolvedValue(null),
    },
  }),
);

vi.mock("@omenai/upstash-config", () => ({
  createWorkflow: vi.fn().mockResolvedValue("workflow-id"),
}));

vi.mock("@omenai/shared-services/orders/releaseOrderLock", () => ({
  releaseOrderLock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/getCurrentDateTime", () => ({
  getFormattedDateTime: vi.fn().mockReturnValue("2026-04-28T00:00:00Z"),
}));

vi.mock("@omenai/shared-utils/src/getCurrencySymbol", () => ({
  getCurrencySymbol: vi.fn().mockReturnValue("USD"),
}));

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn().mockReturnValue("$1,050.00"),
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return {
    ...buildValidateRequestBodyMock(),
    record_tax_transaction: vi.fn().mockResolvedValue(undefined),
  };
});

import { POST } from "../../../app/api/stripe/verifyPaymentTransaction/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { createWorkflow } from "@omenai/upstash-config";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import { record_tax_transaction } from "../../../app/api/util";

const validMeta = {
  buyer_email: "buyer@test.com",
  art_id: "art-456",
  buyer_id: "buyer-123",
  seller_id: "seller-123",
  unit_price: "1000",
  shipping_cost: "30",
  tax_fees: "20",
  commission: "250",
};

const mockPaymentIntent = {
  id: "pi_abc123",
  status: "succeeded",
  amount: 105000,
  amount_received: 105000,
  currency: "usd",
  metadata: validMeta,
};

const mockOrder = {
  order_id: "order-001",
  payment_information: null,
  artwork_data: {
    title: "Sunrise Over Lagos",
    art_id: "art-456",
    artist: "Amara",
    url: "https://cdn.omenai.app/art.jpg",
    pricing: { usd_price: 1000 },
  },
  buyer_details: { id: "buyer-123", name: "Test Buyer", email: "buyer@test.com" },
  seller_details: { id: "seller-123", email: "seller@test.com", name: "Test Seller" },
  seller_designation: "gallery",
  shipping_details: {
    addresses: {
      destination: { street: "123 Main St", city: "NY", country: "US" },
    },
    shipment_information: { quote: { tax_calculation_id: "taxcalc-001" } },
  },
  createdAt: new Date("2026-01-01"),
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/stripe/verifyPaymentTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/stripe/verifyPaymentTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(mockPaymentIntent as any);
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOrder),
    } as any);
    vi.mocked(PurchaseTransactions.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({ upsertedCount: 1 } as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
    vi.mocked(PurchaseTransactions.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
  });

  /* ---- Happy path (payment_intent_id) ---- */

  it("returns 200 with success:true on valid succeeded payment", async () => {
    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Successfully verified purchase transaction");
  });

  it("retrieves payment intent by payment_intent_id", async () => {
    await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith("pi_abc123");
  });

  /* ---- Checkout session flow ---- */

  it("resolves payment intent via checkout_session_id", async () => {
    const mockSession = {
      payment_intent: "pi_from_session",
      metadata: validMeta,
    };
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(mockSession as any);
    vi.mocked(stripe.paymentIntents.retrieve)
      .mockResolvedValueOnce({ ...mockPaymentIntent, id: "pi_from_session" } as any);

    const response = await POST(makeRequest({ checkout_session_id: "cs_abc123" }));
    const body = await response.json();

    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith("cs_abc123");
    expect(body.success).toBe(true);
  });

  it("returns 500 when checkout session has no payment_intent", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue({
      payment_intent: null,
      metadata: validMeta,
    } as any);

    const response = await POST(makeRequest({ checkout_session_id: "cs_expired" }));

    expect(response.status).toBe(500);
  });

  /* ---- Payment not succeeded ---- */

  it("returns 200 with success:false when payment status is not succeeded", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
      ...mockPaymentIntent,
      status: "requires_payment_method",
    } as any);

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Payment failed");
  });

  /* ---- No identifier ---- */

  it("returns 500 when neither payment_intent_id nor checkout_session_id is provided", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(500);
  });

  /* ---- Idempotency ---- */

  it("returns 200 when order payment is already completed (idempotency)", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        ...mockOrder,
        payment_information: { status: "completed" },
      }),
    } as any);

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("updates PurchaseTransactions.verifiedAt and returns 200 when transaction already exists", async () => {
    vi.mocked(PurchaseTransactions.exists).mockResolvedValue({ _id: "tx-existing" } as any);

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));
    const body = await response.json();

    expect(PurchaseTransactions.updateOne).toHaveBeenCalledWith(
      { trans_reference: mockPaymentIntent.id },
      { $set: { verifiedAt: expect.anything() } },
    );
    expect(body.success).toBe(true);
  });

  it("returns 200 when PaymentLedger already exists (idempotency)", async () => {
    vi.mocked(PaymentLedger.exists).mockResolvedValue({ _id: "ledger-existing" } as any);

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(response.status).toBe(200);
  });

  it("returns 200 when upsertedCount === 0 (concurrent race)", async () => {
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({ upsertedCount: 0 } as any);

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(response.status).toBe(200);
  });

  /* ---- Post-payment side effects ---- */

  it("records tax transaction on success", async () => {
    await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(record_tax_transaction).toHaveBeenCalledWith(
      mockOrder.shipping_details.shipment_information.quote.tax_calculation_id,
      mockOrder.order_id,
    );
  });

  it("triggers shipment and payment workflows on success", async () => {
    await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/shipment/create_shipment",
      expect.stringContaining(mockOrder.order_id),
      expect.any(String),
    );
    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
      expect.stringContaining(mockPaymentIntent.id),
      expect.any(String),
    );
  });

  it("releases order lock after successful processing", async () => {
    await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(releaseOrderLock).toHaveBeenCalledWith(
      validMeta.art_id,
      validMeta.buyer_id,
    );
  });

  it("returns 500 when order update fails", async () => {
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when stripe.paymentIntents.retrieve throws", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockRejectedValueOnce(
      new Error("Stripe network error"),
    );

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));

    expect(response.status).toBe(500);
  });

  it("still returns 200 when releaseOrderLock throws (error is swallowed)", async () => {
    vi.mocked(releaseOrderLock).mockRejectedValueOnce(new Error("Lock error"));

    const response = await POST(makeRequest({ payment_intent_id: "pi_abc123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
