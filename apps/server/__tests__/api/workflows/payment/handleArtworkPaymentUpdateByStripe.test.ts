import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/workflow/nextjs", async () => {
  const { buildWorkflowServeMock } = await import("../../../helpers/util-mock");
  return buildWorkflowServeMock();
});

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/transactions/PaymentLedgerShema", () => ({
  PaymentLedger: {
    findOne: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

vi.mock("@omenai/shared-models/models/transactions/PurchaseTransactionSchema", () => ({
  PurchaseTransactions: { updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }) },
}));

vi.mock("@omenai/shared-models/models/sales/SalesActivity", () => ({
  SalesActivity: { updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }) },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    findOneAndUpdate: vi.fn(),
    exists: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { updateMany: vi.fn().mockResolvedValue({ modifiedCount: 1 }) },
}));

vi.mock("@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema", () => ({
  PriceRequest: { updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }) },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: { del: vi.fn().mockResolvedValue(1) },
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("@omenai/shared-utils/src/getCurrentMonthAndYear", () => ({
  getCurrentMonthAndYear: vi.fn().mockReturnValue({ month: 1, year: 2024 }),
}));

import { POST } from "../../../../app/api/workflows/payment/handleArtworkPaymentUpdateByStripe/route";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockMeta = {
  art_id: "art-123",
  buyer_id: "buyer-1",
  seller_id: "seller-1",
  unit_price: "400",
  shipping_cost: "50",
  tax_fees: "25",
  commission: "25",
};

const mockPaymentIntent = {
  id: "pi_test_123",
  amount_received: 50000,
};

const validPayload = {
  provider: "stripe",
  meta: mockMeta,
  paymentIntent: mockPaymentIntent,
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/payment/handleArtworkPaymentUpdateByStripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PaymentLedger.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.mocked(Artworkuploads.findOneAndUpdate).mockResolvedValue({ art_id: "art-123" } as any);
    vi.mocked(Artworkuploads.exists).mockResolvedValue(null);
  });

  it("returns status 200 with data true on success", async () => {
    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
  });

  it("returns early when payment fulfillment already completed (idempotent)", async () => {
    vi.mocked(PaymentLedger.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ payment_fulfillment_checks_done: true }),
    } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
    expect(PurchaseTransactions.updateOne).not.toHaveBeenCalled();
  });

  it("creates a purchase transaction entry", async () => {
    await POST(makeRequest(validPayload));

    expect(PurchaseTransactions.updateOne).toHaveBeenCalledWith(
      { trans_reference: mockPaymentIntent.id },
      expect.objectContaining({ $setOnInsert: expect.any(Object) }),
      { upsert: true },
    );
  });

  it("marks artwork as sold", async () => {
    await POST(makeRequest(validPayload));

    expect(Artworkuploads.findOneAndUpdate).toHaveBeenCalledWith(
      { art_id: mockMeta.art_id, availability: true },
      { $set: { availability: false } },
      { new: true },
    );
  });

  it("updates payment ledger with fulfillment status", async () => {
    await POST(makeRequest(validPayload));

    expect(PaymentLedger.updateOne).toHaveBeenCalledWith(
      { provider_tx_id: mockPaymentIntent.id, provider: "stripe" },
      expect.objectContaining({
        $set: expect.objectContaining({
          payment_fulfillment: expect.any(Object),
          payment_fulfillment_checks_done: expect.any(Boolean),
        }),
      }),
    );
  });
});
