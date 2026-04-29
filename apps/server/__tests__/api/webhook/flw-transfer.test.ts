import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../app/api/webhook/resource-global", () => ({
  verifyWebhookSignature: vi.fn(),
  verifyFlutterwaveTransaction: vi.fn(),
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/wallet/WalletSchema", () => ({
  Wallet: { updateOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/wallet/WalletTransactionSchema", () => ({
  WalletTransaction: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalSuccessMail",
  () => ({
    sendArtistFundsWithdrawalSuccessMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalFailed",
  () => ({
    sendArtistFundsWithdrawalFailed: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalProcessingMail",
  () => ({
    sendArtistFundsWithdrawalProcessingMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-utils/src/priceFormatter", () => ({
  formatPrice: vi.fn((p: number) => `$${p}`),
}));

vi.mock("@omenai/shared-utils/src/toUtcDate", () => ({
  toUTCDate: vi.fn((d: Date) => d),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../app/api/webhook/flw-transfer/route";
import {
  verifyWebhookSignature,
  verifyFlutterwaveTransaction,
} from "../../../app/api/webhook/resource-global";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { sendArtistFundsWithdrawalSuccessMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalSuccessMail";
import { sendArtistFundsWithdrawalFailed } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalFailed";
import { sendArtistFundsWithdrawalProcessingMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalProcessingMail";
import { createErrorRollbarReport } from "../../../app/api/util";

const mockSession = {
  startTransaction: vi.fn(),
  commitTransaction: vi.fn().mockResolvedValue(undefined),
  abortTransaction: vi.fn().mockResolvedValue(undefined),
  endSession: vi.fn().mockResolvedValue(undefined),
  inTransaction: vi.fn().mockReturnValue(false),
};

const baseVerifiedTransaction = {
  status: "success",
  data: {
    id: "txn-123",
    status: "PENDING",
    reference: "ref-abc",
    amount: 500,
    currency: "USD",
    meta: { wallet_id: "wallet-1" },
  },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/webhook/flw-transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "verif-hash": "valid-sig",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/webhook/flw-transfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyWebhookSignature).mockResolvedValue(true);
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(
      baseVerifiedTransaction,
    );
    vi.mocked(connectMongoDB).mockResolvedValue({
      startSession: vi.fn().mockReturnValue(mockSession),
    } as any);
    vi.mocked(WalletTransaction.findOne).mockResolvedValue(null);
    vi.mocked(WalletTransaction.updateOne).mockReturnValue({
      session: vi
        .fn()
        .mockResolvedValue({ modifiedCount: 1, matchedCount: 1, upsertedCount: 0 }),
    } as any);
    vi.mocked(Wallet.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    } as any);
    vi.mocked(AccountArtist.findOne).mockResolvedValue({
      email: "artist@test.com",
      name: "Artist Name",
      wallet_id: "wallet-1",
    } as any);
  });

  it("returns 403 when signature header is missing", async () => {
    const req = new Request("http://localhost/api/webhook/flw-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(req);

    expect(response.status).toBe(403);
  });

  it("returns 403 when signature is invalid", async () => {
    vi.mocked(verifyWebhookSignature).mockResolvedValue(false);

    const response = await POST(makeRequest({ event: "transfer.completed" }));

    expect(response.status).toBe(403);
  });

  it("returns 200 for non transfer.completed events without verifying FLW", async () => {
    const response = await POST(makeRequest({ event: "charge.completed" }));

    expect(response.status).toBe(200);
    expect(verifyFlutterwaveTransaction).not.toHaveBeenCalled();
  });

  it("returns 500 when Flutterwave transaction verification fails", async () => {
    vi.mocked(verifyFlutterwaveTransaction).mockRejectedValue(
      new Error("Transaction verification failed"),
    );

    const response = await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(response.status).toBe(500);
    expect(createErrorRollbarReport).toHaveBeenCalled();
  });

  it("TRANSFER_CREATION: upserts transaction and sends processing email", async () => {
    await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(WalletTransaction.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ trans_flw_ref_id: "txn-123" }),
      expect.objectContaining({ $setOnInsert: expect.any(Object) }),
      { upsert: true },
    );
    expect(sendArtistFundsWithdrawalProcessingMail).toHaveBeenCalled();
    expect(mockSession.commitTransaction).toHaveBeenCalled();
  });

  it("TRANSFER_CREATION: refunds wallet and sends failure email when created as FAILED", async () => {
    const failedTx = {
      ...baseVerifiedTransaction,
      data: { ...baseVerifiedTransaction.data, status: "FAILED" },
    };
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(failedTx);

    await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(Wallet.updateOne).toHaveBeenCalledWith(
      { wallet_id: "wallet-1" },
      { $inc: { available_balance: 500 } },
    );
    expect(sendArtistFundsWithdrawalFailed).toHaveBeenCalled();
  });

  it("IDEMPOTENCY: returns 200 when existing transaction has same status", async () => {
    vi.mocked(WalletTransaction.findOne).mockResolvedValue({
      trans_flw_ref_id: "txn-123",
      trans_status: "PENDING",
    } as any);
    const pendingTx = {
      ...baseVerifiedTransaction,
      data: { ...baseVerifiedTransaction.data, status: "PENDING" },
    };
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(pendingTx);

    const response = await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(response.status).toBe(200);
    expect(WalletTransaction.updateOne).not.toHaveBeenCalled();
  });

  it("reports error and returns 200 when a SUCCESSFUL transaction receives a FAILED webhook", async () => {
    vi.mocked(WalletTransaction.findOne).mockResolvedValue({
      trans_flw_ref_id: "txn-123",
      trans_status: "SUCCESSFUL",
    } as any);
    const failedTx = {
      ...baseVerifiedTransaction,
      data: { ...baseVerifiedTransaction.data, status: "FAILED" },
    };
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(failedTx);

    const response = await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(response.status).toBe(200);
    expect(createErrorRollbarReport).toHaveBeenCalled();
    expect(Wallet.updateOne).not.toHaveBeenCalled();
  });

  it("TRANSFER_PENDING: updates transaction status to PENDING", async () => {
    vi.mocked(WalletTransaction.findOne).mockResolvedValue({
      trans_flw_ref_id: "txn-123",
      trans_status: "NEW",
    } as any);
    const pendingTx = {
      ...baseVerifiedTransaction,
      data: { ...baseVerifiedTransaction.data, status: "PENDING" },
    };
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(pendingTx);

    await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(WalletTransaction.updateOne).toHaveBeenCalledWith(
      { trans_flw_ref_id: "txn-123" },
      { $set: { trans_status: "PENDING" } },
    );
  });

  it("TRANSFER_SUCCESS: updates status and sends withdrawal success email", async () => {
    vi.mocked(WalletTransaction.findOne).mockResolvedValue({
      trans_flw_ref_id: "txn-123",
      trans_status: "PENDING",
    } as any);
    const successTx = {
      ...baseVerifiedTransaction,
      data: { ...baseVerifiedTransaction.data, status: "SUCCESSFUL" },
    };
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(successTx);

    await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(WalletTransaction.updateOne).toHaveBeenCalledWith(
      { trans_flw_ref_id: "txn-123" },
      { $set: { trans_status: "SUCCESSFUL" } },
    );
    expect(sendArtistFundsWithdrawalSuccessMail).toHaveBeenCalled();
  });

  it("TRANSFER_FAILURE: updates status, refunds wallet, and sends failure email", async () => {
    vi.mocked(WalletTransaction.findOne).mockResolvedValue({
      trans_flw_ref_id: "txn-123",
      trans_status: "PENDING",
    } as any);
    const failedTx = {
      ...baseVerifiedTransaction,
      data: { ...baseVerifiedTransaction.data, status: "FAILED" },
    };
    vi.mocked(verifyFlutterwaveTransaction).mockResolvedValue(failedTx);

    await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(WalletTransaction.updateOne).toHaveBeenCalledWith(
      { trans_flw_ref_id: "txn-123", trans_status: { $ne: "FAILED" } },
      { $set: { trans_status: "FAILED" } },
    );
    expect(Wallet.updateOne).toHaveBeenCalledWith(
      { wallet_id: "wallet-1" },
      { $inc: { available_balance: 500 } },
    );
    expect(sendArtistFundsWithdrawalFailed).toHaveBeenCalled();
  });

  it("aborts the transaction and returns 500 on a DB error", async () => {
    vi.mocked(WalletTransaction.updateOne).mockReturnValue({
      session: vi.fn().mockRejectedValue(new Error("DB write failed")),
    } as any);

    const response = await POST(
      makeRequest({ event: "transfer.completed", data: { id: "txn-123" } }),
    );

    expect(response.status).toBe(500);
    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });
});
