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

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: {
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    exists: vi.fn().mockResolvedValue(null),
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

vi.mock("../../../../app/api/util", () => ({
  buildPricing: vi.fn().mockReturnValue({ penalty_fee: 0, commission: 50 }),
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/workflows/payment/handleArtworkPaymentUpdatesByFlw/route";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockMeta = {
  art_id: "art-123",
  buyer_id: "buyer-1",
  seller_id: "seller-1",
  unit_price: "400",
  shipping_cost: "50",
  tax_fees: "25",
  order_id: "order-123",
};

const mockVerifiedTransaction = {
  id: "flw_tx_123",
  amount: 500,
  status: "successful",
};

const validPayload = {
  provider: "flutterwave",
  meta: mockMeta,
  verified_transaction: mockVerifiedTransaction,
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/workflows/payment/handleArtworkPaymentUpdatesByFlw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PaymentLedger.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ exclusivity_uphold_status: { upheld: false } }),
    } as any);
    vi.mocked(Artworkuploads.findOneAndUpdate).mockResolvedValue({ art_id: "art-123" } as any);
    vi.mocked(Artworkuploads.exists).mockResolvedValue(null);
    vi.mocked(Wallet.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);
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
    expect(AccountArtist.findOne).not.toHaveBeenCalled();
  });

  it("returns true when artist is not found (no rollback)", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
    expect(PurchaseTransactions.updateOne).not.toHaveBeenCalled();
  });

  it("increments seller wallet with correct amount", async () => {
    await POST(makeRequest(validPayload));

    expect(Wallet.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: mockMeta.seller_id }),
      expect.objectContaining({ $inc: { pending_balance: expect.any(Number) } }),
    );
  });

  it("creates purchase transaction entry", async () => {
    await POST(makeRequest(validPayload));

    expect(PurchaseTransactions.updateOne).toHaveBeenCalledWith(
      { trans_reference: mockVerifiedTransaction.id },
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

  it("updates payment ledger at the end", async () => {
    await POST(makeRequest(validPayload));

    expect(PaymentLedger.updateOne).toHaveBeenCalledWith(
      { provider_tx_id: mockVerifiedTransaction.id, provider: "flutterwave" },
      expect.objectContaining({
        $set: expect.objectContaining({
          payment_fulfillment: expect.any(Object),
        }),
      }),
    );
  });
});
