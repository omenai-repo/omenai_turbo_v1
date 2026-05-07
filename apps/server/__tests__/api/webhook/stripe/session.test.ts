import { describe, it, expect, vi, beforeEach } from "vitest";

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
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
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
    PurchaseTransactions: { exists: vi.fn() },
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

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  record_tax_transaction: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../../../../app/api/webhook/stripe/session/route";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";

const basePaymentIntent = {
  id: "pi_test_123",
  status: "succeeded",
  amount: 53000,
  amount_received: 53000,
  currency: "usd",
  metadata: {
    buyer_email: "buyer@test.com",
    art_id: "art-1",
    buyer_id: "buyer-1",
    unit_price: "500",
    shipping_cost: "20",
    tax_fees: "10",
    commission: "50",
  },
};

const baseOrder = {
  order_id: "order-001",
  buyer_details: { id: "buyer-1", email: "buyer@test.com", name: "John" },
  seller_details: { id: "seller-1", email: "seller@test.com", name: "Jane" },
  seller_designation: "artist",
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

function makeRequest(signature = "valid-sig"): Request {
  return new Request("http://localhost/api/webhook/stripe/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: JSON.stringify({}),
  });
}

function makeSessionCompletedEvent(overrides: Partial<any> = {}) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        payment_intent: "pi_test_123",
        metadata: {
          art_id: "art-1",
          buyer_id: "buyer-1",
        },
        ...overrides,
      },
    },
  };
}

describe("POST /api/webhook/stripe/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("STRIPE_CHECKOUT_SESSION_WEBHOOK_SECRET", "test-stripe-secret");

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSessionCompletedEvent() as any,
    );
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(
      basePaymentIntent as any,
    );

    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(baseOrder),
    } as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);

    vi.mocked(PurchaseTransactions.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 1,
    } as any);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns status 400 in body when stripe signature verification throws", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const response = await POST(makeRequest("bad-sig"));
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("returns 200 for unhandled event types", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    } as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(CreateOrder.findOne).not.toHaveBeenCalled();
  });

  it("checkout.session.expired: releases order lock and returns 200", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "checkout.session.expired",
      data: {
        object: {
          metadata: { art_id: "art-1", buyer_id: "buyer-1" },
        },
      },
    } as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(releaseOrderLock).toHaveBeenCalledWith("art-1", "buyer-1");
  });

  it("checkout.session.expired: returns 200 without lock release when metadata is absent", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "checkout.session.expired",
      data: { object: { metadata: {} } },
    } as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(releaseOrderLock).not.toHaveBeenCalled();
  });

  it("checkout.session.completed: returns status 400 in body when payment_intent is missing", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSessionCompletedEvent({ payment_intent: null }) as any,
    );

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("checkout.session.completed: returns status 400 in body when paymentIntents.retrieve throws", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockRejectedValue(
      new Error("Not found"),
    );

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("checkout.session.completed: returns status 400 in body when payment intent is not succeeded", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
      ...basePaymentIntent,
      status: "requires_payment_method",
    } as any);

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("checkout.session.completed: returns status 400 in body when metadata fields are missing", async () => {
    vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
      ...basePaymentIntent,
      metadata: {},
    } as any);

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("checkout.session.completed: returns status 400 in body when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("checkout.session.completed: returns 200 when payment is already completed", async () => {
    vi.mocked(CreateOrder.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        ...baseOrder,
        payment_information: { status: "completed" },
      }),
    } as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("checkout.session.completed: returns 200 when transaction already exists (idempotency)", async () => {
    vi.mocked(PurchaseTransactions.exists).mockResolvedValue("exists" as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("checkout.session.completed: returns status 500 in body when payment ledger write fails", async () => {
    vi.mocked(PaymentLedger.updateOne).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(body.status).toBe(500);
  });

  it("checkout.session.completed: returns 200 when ledger upsert is a duplicate (upsertedCount 0)", async () => {
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 0,
    } as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(CreateOrder.updateOne).not.toHaveBeenCalled();
  });

  it("checkout.session.completed: returns 400 when order update has no effect", async () => {
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
  });

  it("checkout.session.completed: triggers workflows and returns 200 on success", async () => {
    const response = await POST(makeRequest());

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
});
