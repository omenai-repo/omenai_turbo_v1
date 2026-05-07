import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
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
  "@omenai/shared-models/models/transactions/PaymentLedgerShema",
  () => ({
    PaymentLedger: {
      exists: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock(
  "@omenai/shared-models/models/transactions/PurchaseTransactionSchema",
  () => ({
    PurchaseTransactions: {
      exists: vi.fn(),
      updateOne: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/device_management/DeviceManagementSchema",
  () => ({
    DeviceManagement: {
      findOne: vi.fn().mockResolvedValue(null),
    },
  }),
);

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue("workflow-id"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail",
  () => ({
    sendPaymentFailedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/getCurrentDateTime", () => ({
  getFormattedDateTime: vi.fn().mockReturnValue("2026-04-27T00:00:00Z"),
}));

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn().mockReturnValue("$1,000.00"),
}));

vi.mock("../../../app/api/util", () => ({
  buildPricing: vi.fn().mockReturnValue({ penalty_fee: 0, commission: 50 }),
  createErrorRollbarReport: vi.fn(),
  record_tax_transaction: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../../../app/api/transactions/verify_FLW_transaction/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { record_tax_transaction } from "../../../app/api/util";

/* ----------------------------- Mock data ---------------------------------- */

const flwTxId = "flw-tx-99999";

const validMeta = {
  buyer_email: "buyer@test.com",
  buyer_id: "buyer-123",
  seller_id: "seller-123",
  art_id: "art-456",
  unit_price: 1000,
  shipping_cost: 30,
  tax_fees: 20,
  type: "artwork",
};

const validFlwResponse = {
  data: {
    id: flwTxId,
    status: "successful",
    amount: 1050, // unit_price(1000) + shipping(30) + tax(20)
    currency: "USD",
    meta: validMeta,
  },
};

const mockOrderInfo = {
  order_id: "order-001",
  payment_information: null,
  artwork_data: {
    title: "Sunrise Over Lagos",
    art_id: "art-456",
    artist: "Amara Nwosu",
    url: "https://cdn.omenai.app/artwork.jpg",
    pricing: { usd_price: 1000 },
  },
  buyer_details: {
    id: "buyer-123",
    name: "Test Buyer",
    email: "buyer@test.com",
  },
  seller_details: {
    id: "seller-123",
    email: "seller@test.com",
    name: "Test Seller",
  },
  seller_designation: "artist",
  shipping_details: {
    addresses: {
      destination: { street: "123 Main St", city: "New York", country: "US" },
    },
    shipment_information: {
      quote: { tax_calculation_id: "taxcalc-001" },
    },
  },
  createdAt: new Date("2026-01-01"),
};

const mockArtist = { exclusivity_uphold_status: false };

/* ----------------------------- Helpers ------------------------------------ */

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/transactions/verify_FLW_transaction",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function stubFetch(responseData: any, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: vi.fn().mockResolvedValue(responseData),
      text: vi.fn().mockResolvedValue("error body"),
    }),
  );
}

/* ----------------------------- Tests -------------------------------------- */

describe("POST /api/transactions/verify_FLW_transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FLW_SECRET_KEY = "test-flw-secret-key";
    stubFetch(validFlwResponse);
    vi.mocked(CreateOrder.findOne).mockResolvedValue(mockOrderInfo as any);
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(PurchaseTransactions.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 1,
    } as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
    vi.mocked(PurchaseTransactions.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.FLW_SECRET_KEY;
  });

  /* ---- Input validation ---- */

  it("returns 400 when transaction_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Transaction ID is required");
    expect(body.ok).toBe(false);
  });

  /* ---- Flutterwave API failures ---- */

  it("returns 500 when Flutterwave API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.ok).toBe(false);
  });

  it("returns 500 when Flutterwave returns non-OK status", async () => {
    stubFetch({}, false);

    const response = await POST(makeRequest({ transaction_id: flwTxId }));

    expect(response.status).toBe(500);
  });

  /* ---- Meta validation ---- */

  it("returns 200 with ok:true and success:false when transaction meta is invalid", async () => {
    stubFetch({ data: { id: flwTxId, status: "successful", amount: 1050, currency: "USD", meta: null } });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid transaction data");
  });

  it("returns 200 with ok:true and success:false when meta is missing required buyer_email", async () => {
    const noEmailMeta = { ...validMeta };
    delete (noEmailMeta as any).buyer_email;
    stubFetch({
      data: { ...validFlwResponse.data, meta: noEmailMeta },
    });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(false);
  });

  /* ---- Order lookup ---- */

  it("returns 400 when matching order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValueOnce(null);

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/Order not found/i);
  });

  /* ---- Security / fraud checks ---- */

  it("returns 400 when unit price in meta does not match DB price", async () => {
    const tamperedMeta = { ...validMeta, unit_price: 500 }; // DB price is 1000
    stubFetch({
      data: { ...validFlwResponse.data, meta: tamperedMeta },
    });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/Price mismatch/i);
  });

  it("returns 400 when total paid amount does not match expected total", async () => {
    stubFetch({
      data: { ...validFlwResponse.data, amount: 500 }, // should be 1050
    });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/Payment amount mismatch/i);
  });

  it("returns 400 when payment currency is not USD", async () => {
    stubFetch({
      data: { ...validFlwResponse.data, currency: "NGN" },
    });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/Invalid currency/i);
  });

  /* ---- Payment status ---- */

  it("returns 400 and sends payment failed email when FLW status is not successful", async () => {
    stubFetch({
      data: { ...validFlwResponse.data, status: "failed" },
    });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.success).toBe(false);
    expect(sendPaymentFailedMail).toHaveBeenCalledWith({
      email: mockOrderInfo.buyer_details.email,
      name: mockOrderInfo.buyer_details.name,
      artwork: mockOrderInfo.artwork_data.title,
    });
  });

  it("returns 400 when FLW status is pending", async () => {
    stubFetch({
      data: { ...validFlwResponse.data, status: "pending" },
    });

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.status).toBe("pending");
  });

  /* ---- Idempotency ---- */

  it("returns 200 when order payment is already completed", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValueOnce({
      ...mockOrderInfo,
      payment_information: { status: "completed" },
    } as any);

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Transaction already verified");
  });

  it("returns 200 when transaction was already processed (PurchaseTransactions exists)", async () => {
    vi.mocked(PurchaseTransactions.exists).mockResolvedValueOnce(
      { _id: "existing-tx" } as any,
    );

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Transaction already processed successfully");
  });

  it("returns 200 when transaction was already processed (PaymentLedger exists)", async () => {
    vi.mocked(PaymentLedger.exists).mockResolvedValueOnce(
      { _id: "existing-ledger" } as any,
    );

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.message).toBe("Transaction already processed successfully");
  });

  it("updates PurchaseTransactions.verifiedAt when idempotency check hits", async () => {
    vi.mocked(PurchaseTransactions.exists).mockResolvedValueOnce({ _id: "tx" } as any);

    await POST(makeRequest({ transaction_id: flwTxId }));

    expect(PurchaseTransactions.updateOne).toHaveBeenCalledWith(
      { trans_reference: flwTxId },
      { $set: { verifiedAt: expect.anything() } },
    );
  });

  /* ---- PaymentLedger upsert ---- */

  it("returns 400 when PaymentLedger creation fails after retries", async () => {
    vi.mocked(PaymentLedger.updateOne).mockRejectedValue(
      new Error("DB write failed"),
    );

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/Payment ledger creation unsuccessful/i);
  }, 10000);

  it("returns 200 when concurrent request wins the upsert race (upsertedCount=0)", async () => {
    vi.mocked(PaymentLedger.updateOne).mockResolvedValueOnce({
      upsertedCount: 0,
    } as any);

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Transaction processed");
  });

  /* ---- Order update ---- */

  it("returns 200 with ok:true when order update fails (payment safe, just update issue)", async () => {
    vi.mocked(CreateOrder.updateOne).mockResolvedValueOnce({
      modifiedCount: 0,
    } as any);

    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/having trouble updating your order/i);
  });

  /* ---- Happy path ---- */

  it("returns 200 with success on valid payment verification", async () => {
    const response = await POST(makeRequest({ transaction_id: flwTxId }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.success).toBe(true);
    expect(body.status).toBe("successful");
    expect(body.order_id).toBe(mockOrderInfo.order_id);
  });

  it("updates order with payment_information on success", async () => {
    await POST(makeRequest({ transaction_id: flwTxId }));

    expect(CreateOrder.updateOne).toHaveBeenCalledWith(
      { order_id: mockOrderInfo.order_id },
      expect.objectContaining({
        $set: expect.objectContaining({
          payment_information: expect.objectContaining({
            status: "completed",
            transaction_reference: flwTxId,
          }),
        }),
      }),
    );
  });

  it("records tax transaction on success", async () => {
    await POST(makeRequest({ transaction_id: flwTxId }));

    expect(record_tax_transaction).toHaveBeenCalledWith(
      mockOrderInfo.shipping_details.shipment_information.quote.tax_calculation_id,
      mockOrderInfo.order_id,
    );
  });

  it("triggers fulfillment workflow on success", async () => {
    await POST(makeRequest({ transaction_id: flwTxId }));

    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
      expect.stringContaining(`flw_payment_workflow_${flwTxId}`),
      expect.any(String),
    );
  });

  it("triggers shipment creation workflow on success", async () => {
    await POST(makeRequest({ transaction_id: flwTxId }));

    expect(createWorkflow).toHaveBeenCalledWith(
      "/api/workflows/shipment/create_shipment",
      expect.stringContaining(mockOrderInfo.order_id),
      expect.any(String),
    );
  });
});
