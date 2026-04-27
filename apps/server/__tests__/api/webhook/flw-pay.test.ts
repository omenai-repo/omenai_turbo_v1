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

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
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

vi.mock(
  "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail",
  () => ({
    sendPaymentFailedMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn((p: number) => `$${p}`),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/getCurrentDateTime", () => ({
  getFormattedDateTime: vi.fn().mockReturnValue("2025-01-01T00:00:00Z"),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
  ZMetaSchema: {
    safeParse: vi.fn(),
  },
  retry: vi.fn().mockImplementation((fn: any) => fn()),
  buildPricing: vi.fn().mockReturnValue({ penalty_fee: 0, commission: 50 }),
  record_tax_transaction: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../../../app/api/webhook/flw-pay/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { ZMetaSchema, createErrorRollbarReport } from "../../../app/api/util";

const VALID_SECRET = "test-flw-secret-hash";

const baseMeta = {
  buyer_email: "buyer@test.com",
  art_id: "art-1",
  seller_id: "seller-1",
  unit_price: "500",
  shipping_cost: "20",
  tax_fees: "10",
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
};

const baseVerifiedTransaction = {
  data: {
    id: "flw-txn-123",
    status: "successful",
    tx_ref: "tx-ref-abc",
    amount: "530",
    currency: "USD",
    meta: baseMeta,
  },
};

const baseRequestBody = {
  event: "charge.completed",
  data: {
    id: "flw-txn-123",
    tx_ref: "tx-ref-abc",
    amount: "530",
    currency: "USD",
  },
};

function makeRequest(body: object, signature = VALID_SECRET): Request {
  return new Request("http://localhost/api/webhook/flw-pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "verif-hash": signature,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/webhook/flw-pay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("FLW_SECRET_HASH", VALID_SECRET);

    vi.mocked(ZMetaSchema.safeParse).mockReturnValue({
      success: true,
      data: baseMeta,
    } as any);

    vi.mocked(CreateOrder.findOne).mockResolvedValue(baseOrder as any);
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);

    vi.mocked(AccountArtist.findOne).mockResolvedValue({
      exclusivity_uphold_status: { isBreached: false, incident_count: 0 },
    } as any);

    vi.mocked(PurchaseTransactions.exists).mockResolvedValue(null);
    vi.mocked(PurchaseTransactions.updateOne).mockResolvedValue({
      modifiedCount: 1,
    } as any);

    vi.mocked(PaymentLedger.exists).mockResolvedValue(null);
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 1,
    } as any);

    vi.mocked(DeviceManagement.findOne).mockResolvedValue(null);

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => baseVerifiedTransaction,
    } as any);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 403 when signature is invalid", async () => {
    const response = await POST(makeRequest(baseRequestBody, "wrong-secret"));

    expect(response.status).toBe(403);
  });

  it("returns 200 for non charge.completed events without calling FLW verify", async () => {
    const response = await POST(
      makeRequest({ event: "transfer.completed", data: {} }),
    );

    expect(response.status).toBe(200);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns status 400 in body when meta parsing fails", async () => {
    vi.mocked(ZMetaSchema.safeParse).mockReturnValue({
      success: false,
      error: {},
    } as any);

    const response = await POST(makeRequest(baseRequestBody));
    const body = await response.json();

    expect(body.status).toBe(400);
  });

  it("returns 200 when order is not found", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("returns 200 early when FLW status is pending", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        data: { ...baseVerifiedTransaction.data, status: "pending" },
      }),
    } as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("calls sendPaymentFailedMail and returns 200 when FLW status is failed", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        data: { ...baseVerifiedTransaction.data, status: "failed" },
      }),
    } as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(sendPaymentFailedMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@test.com" }),
    );
  });

  it("returns 200 early when amounts do not match (shouldExitEarly)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        data: {
          ...baseVerifiedTransaction.data,
          status: "successful",
          amount: "999",
        },
      }),
    } as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("returns 200 when payment is already completed", async () => {
    vi.mocked(CreateOrder.findOne).mockResolvedValue({
      ...baseOrder,
      payment_information: { status: "completed" },
    } as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("IDEMPOTENCY: updates existing transaction and returns 200", async () => {
    vi.mocked(PurchaseTransactions.exists).mockResolvedValue("exists" as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(PurchaseTransactions.updateOne).toHaveBeenCalledWith(
      { trans_reference: "flw-txn-123" },
      expect.objectContaining({
        $set: expect.objectContaining({ webhookConfirmed: true }),
      }),
    );
    expect(PaymentLedger.updateOne).not.toHaveBeenCalled();
  });

  it("returns 400 when payment ledger creation fails after retries", async () => {
    vi.mocked(PaymentLedger.updateOne).mockRejectedValue(new Error("DB error"));

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(400);
  });

  it("returns 200 when atomic upsert detects a duplicate (upsertedCount === 0)", async () => {
    vi.mocked(PaymentLedger.updateOne).mockResolvedValue({
      upsertedCount: 0,
    } as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(200);
    expect(CreateOrder.updateOne).not.toHaveBeenCalled();
  });

  it("returns 400 when the order update has no effect (modifiedCount === 0)", async () => {
    vi.mocked(CreateOrder.updateOne).mockResolvedValue({
      modifiedCount: 0,
    } as any);

    const response = await POST(makeRequest(baseRequestBody));

    expect(response.status).toBe(400);
  });

  it("triggers downstream workflows and returns 200 on a successful payment", async () => {
    const response = await POST(makeRequest(baseRequestBody));

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
      expect.stringContaining("/api/workflows/payment/handleArtworkPaymentUpdatesByFlw"),
      expect.any(String),
      expect.any(String),
    );
    expect(createWorkflow).toHaveBeenCalledWith(
      expect.stringContaining("/api/workflows/shipment/create_shipment"),
      expect.any(String),
      expect.any(String),
    );
  });
});
