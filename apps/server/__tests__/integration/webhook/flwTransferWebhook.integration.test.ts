/**
 * Integration tests for POST /api/webhook/flw-transfer
 *
 * Strategy:
 * - `resource-global` is mocked so we control signature verification and
 *   Flutterwave transaction verification outcomes.
 * - `connectMongoDB` is overridden to return a fake MongoDB client whose
 *   `startSession()` returns a lightweight mock session.  Mongoose queries
 *   `.session(mockSession)` silently proceed without lsid (no real transaction
 *   is started), so the actual DB operations run against the in-memory server.
 * - Email functions are stubbed to prevent network calls.
 *
 * Variables used inside vi.mock factories must be initialised via vi.hoisted()
 * to avoid temporal-dead-zone issues with Vitest's hoisting.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

// ── Hoisted mocks (safe to use inside vi.mock factories) ────────────────────

const { mockVerifySignature, mockVerifyTransaction } = vi.hoisted(() => ({
  mockVerifySignature: vi.fn(),
  mockVerifyTransaction: vi.fn(),
}));

// ── Module-level mocks ───────────────────────────────────────────────────────

// Use a real MongoClient session (satisfies driver validation), but override
// transaction methods — MongoMemoryServer in standalone mode does not support
// multi-document transactions, so startTransaction / commitTransaction /
// abortTransaction must be no-ops to prevent the route from throwing.
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", async () => {
  const { default: mongoose } = await import("mongoose");
  return {
    connectMongoDB: vi.fn().mockImplementation(async () => ({
      startSession: vi.fn().mockImplementation(() => {
        const session = mongoose.connection.getClient().startSession();
        session.startTransaction = vi.fn() as any;
        session.commitTransaction = vi.fn().mockResolvedValue(undefined) as any;
        session.abortTransaction = vi.fn().mockResolvedValue(undefined) as any;
        return session;
      }),
    })),
  };
});

vi.mock("../../../app/api/webhook/resource-global", () => ({
  verifyWebhookSignature: mockVerifySignature,
  verifyFlutterwaveTransaction: mockVerifyTransaction,
}));

vi.mock("@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalSuccessMail", () => ({
  sendArtistFundsWithdrawalSuccessMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalFailed", () => ({
  sendArtistFundsWithdrawalFailed: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalProcessingMail", () => ({
  sendArtistFundsWithdrawalProcessingMail: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "../../../app/api/webhook/flw-transfer/route";
import { sendArtistFundsWithdrawalSuccessMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalSuccessMail";
import { sendArtistFundsWithdrawalFailed } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalFailed";
import { sendArtistFundsWithdrawalProcessingMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalProcessingMail";

// ── Constants ────────────────────────────────────────────────────────────────

const WALLET_ID = "wallet-transfer-001";
const FLW_REF_ID = 77001;

// ── Fixture factories ────────────────────────────────────────────────────────

function makeTransferBody(statusOverride?: string) {
  return {
    event: "transfer.completed",
    data: {
      id: FLW_REF_ID,
      reference: "TRANSFER_REF_001",
      amount: 500,
      currency: "USD",
      status: statusOverride ?? "SUCCESSFUL",
      meta: { wallet_id: WALLET_ID },
    },
  };
}

function makeVerifiedTransfer(statusOverride?: string) {
  return {
    status: "success",
    data: {
      id: FLW_REF_ID,
      reference: "TRANSFER_REF_001",
      amount: 500,
      currency: "USD",
      status: statusOverride ?? "SUCCESSFUL",
      meta: { wallet_id: WALLET_ID },
    },
  };
}

function makeWalletTx(overrides: Record<string, any> = {}) {
  return {
    wallet_id: WALLET_ID,
    trans_amount: 500,
    trans_status: "NEW",
    trans_date: { year: 2025, month: 1, day: 15 },
    trans_flw_ref_id: FLW_REF_ID,
    ...overrides,
  };
}

function makeWallet(overrides: Record<string, any> = {}) {
  return {
    owner_id: "artist-transfer-001",
    wallet_id: WALLET_ID,
    base_currency: "USD",
    available_balance: 1000,
    pending_balance: 0,
    applied_payment_refs: [],
    ...overrides,
  };
}

function makeArtist(overrides: Record<string, any> = {}) {
  return {
    name: "Kofi Mensah",
    email: "kofi.mensah@test.com",
    profile_status: "ghost",
    artist_id: "artist-transfer-001",
    wallet_id: WALLET_ID,
    ...overrides,
  };
}

function makeRequest(body: object, signature = "valid-sig") {
  return new Request("http://localhost/api/webhook/flw-transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "verif-hash": signature,
    },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.clearAllMocks();
  await Promise.all([
    WalletTransaction.deleteMany({}),
    Wallet.deleteMany({}),
    AccountArtist.deleteMany({}),
  ]);
});

// ── Signature verification ───────────────────────────────────────────────────

describe("POST /api/webhook/flw-transfer — signature verification", () => {
  it("returns 403 when verif-hash header is absent", async () => {
    const req = new Request("http://localhost/api/webhook/flw-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeTransferBody()),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("Missing signature");
  });

  it("returns 403 when signature verification fails", async () => {
    mockVerifySignature.mockResolvedValue(false);

    const res = await POST(makeRequest(makeTransferBody(), "bad-sig"));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("Invalid webhook signature");
  });
});

// ── Event filtering ───────────────────────────────────────────────────────────

describe("POST /api/webhook/flw-transfer — event filtering", () => {
  beforeEach(() => {
    mockVerifySignature.mockResolvedValue(true);
  });

  it("returns 200 immediately for non-transfer.completed events", async () => {
    const res = await POST(makeRequest({ event: "charge.completed", data: { id: 1 } }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe(200);
    expect(mockVerifyTransaction).not.toHaveBeenCalled();
  });
});

// ── NEW transfer (first webhook received) ─────────────────────────────────────

describe("POST /api/webhook/flw-transfer — new transfer creation", () => {
  beforeEach(async () => {
    mockVerifySignature.mockResolvedValue(true);
    mockVerifyTransaction.mockResolvedValue(makeVerifiedTransfer("NEW"));
    await Wallet.create(makeWallet());
    await AccountArtist.create(makeArtist());
  });

  it("creates a WalletTransaction record with status NEW", async () => {
    const res = await POST(makeRequest(makeTransferBody("NEW")));
    expect(res.status).toBe(200);

    const tx = await WalletTransaction.findOne({ trans_flw_ref_id: FLW_REF_ID });
    expect(tx).not.toBeNull();
    expect(tx!.trans_status).toBe("NEW");
    expect(tx!.trans_amount).toBe(500);
  });

  it("sends withdrawal-processing email to the artist", async () => {
    await POST(makeRequest(makeTransferBody("NEW")));

    expect(sendArtistFundsWithdrawalProcessingMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String) }),
    );
  });
});

// ── PENDING transition ────────────────────────────────────────────────────────

describe("POST /api/webhook/flw-transfer — PENDING transition", () => {
  beforeEach(async () => {
    mockVerifySignature.mockResolvedValue(true);
    mockVerifyTransaction.mockResolvedValue(makeVerifiedTransfer("PENDING"));
    await WalletTransaction.create(makeWalletTx({ trans_status: "NEW" }));
    await Wallet.create(makeWallet());
    await AccountArtist.create(makeArtist());
  });

  it("updates existing transaction status to PENDING", async () => {
    const res = await POST(makeRequest(makeTransferBody("PENDING")));
    expect(res.status).toBe(200);

    const tx = await WalletTransaction.findOne({ trans_flw_ref_id: FLW_REF_ID });
    expect(tx!.trans_status).toBe("PENDING");
  });
});

// ── SUCCESSFUL transition ─────────────────────────────────────────────────────

describe("POST /api/webhook/flw-transfer — SUCCESSFUL transition", () => {
  beforeEach(async () => {
    mockVerifySignature.mockResolvedValue(true);
    mockVerifyTransaction.mockResolvedValue(makeVerifiedTransfer("SUCCESSFUL"));
    await WalletTransaction.create(makeWalletTx({ trans_status: "PENDING" }));
    await Wallet.create(makeWallet());
    await AccountArtist.create(makeArtist());
  });

  it("updates transaction status to SUCCESSFUL", async () => {
    const res = await POST(makeRequest(makeTransferBody("SUCCESSFUL")));
    expect(res.status).toBe(200);

    const tx = await WalletTransaction.findOne({ trans_flw_ref_id: FLW_REF_ID });
    expect(tx!.trans_status).toBe("SUCCESSFUL");
  });

  it("sends success email to the artist", async () => {
    await POST(makeRequest(makeTransferBody("SUCCESSFUL")));

    expect(sendArtistFundsWithdrawalSuccessMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String) }),
    );
  });

  it("is idempotent — re-delivery with same status does not trigger a second email", async () => {
    await POST(makeRequest(makeTransferBody("SUCCESSFUL")));
    // Simulate re-delivery with the same SUCCESSFUL status
    mockVerifyTransaction.mockResolvedValue(makeVerifiedTransfer("SUCCESSFUL"));
    const res2 = await POST(makeRequest(makeTransferBody("SUCCESSFUL")));
    expect(res2.status).toBe(200);
    // Email should only have been sent once
    expect(sendArtistFundsWithdrawalSuccessMail).toHaveBeenCalledTimes(1);
  });
});

// ── FAILED transition ─────────────────────────────────────────────────────────

describe("POST /api/webhook/flw-transfer — FAILED transition", () => {
  beforeEach(async () => {
    mockVerifySignature.mockResolvedValue(true);
    mockVerifyTransaction.mockResolvedValue(makeVerifiedTransfer("FAILED"));
    await WalletTransaction.create(makeWalletTx({ trans_status: "PENDING" }));
    await Wallet.create(makeWallet({ available_balance: 1000 }));
    await AccountArtist.create(makeArtist());
  });

  it("updates transaction status to FAILED", async () => {
    const res = await POST(makeRequest(makeTransferBody("FAILED")));
    expect(res.status).toBe(200);

    const tx = await WalletTransaction.findOne({ trans_flw_ref_id: FLW_REF_ID });
    expect(tx!.trans_status).toBe("FAILED");
  });

  it("refunds the transfer amount back to the wallet's available_balance", async () => {
    await POST(makeRequest(makeTransferBody("FAILED")));

    const wallet = await Wallet.findOne({ wallet_id: WALLET_ID });
    // 1000 (initial) + 500 (refund) = 1500
    expect(wallet!.available_balance).toBe(1500);
  });

  it("sends failure email to the artist", async () => {
    await POST(makeRequest(makeTransferBody("FAILED")));

    expect(sendArtistFundsWithdrawalFailed).toHaveBeenCalledWith(
      expect.objectContaining({ email: expect.any(String) }),
    );
  });

  it("does NOT refund if the transaction was already marked FAILED (idempotency)", async () => {
    // Pre-mark the transaction as FAILED to simulate re-delivery
    await WalletTransaction.updateOne(
      { trans_flw_ref_id: FLW_REF_ID },
      { $set: { trans_status: "FAILED" } },
    );

    await POST(makeRequest(makeTransferBody("FAILED")));

    const wallet = await Wallet.findOne({ wallet_id: WALLET_ID });
    // Balance must not have changed — no double-refund
    expect(wallet!.available_balance).toBe(1000);
  });

  it("refuses to mark a SUCCESSFUL transaction as FAILED", async () => {
    await WalletTransaction.updateOne(
      { trans_flw_ref_id: FLW_REF_ID },
      { $set: { trans_status: "SUCCESSFUL" } },
    );

    const res = await POST(makeRequest(makeTransferBody("FAILED")));
    // Route still returns 200 (webhook acknowledged) but the DB status stays SUCCESSFUL
    expect(res.status).toBe(200);

    const tx = await WalletTransaction.findOne({ trans_flw_ref_id: FLW_REF_ID });
    expect(tx!.trans_status).toBe("SUCCESSFUL");

    // No refund was applied
    const wallet = await Wallet.findOne({ wallet_id: WALLET_ID });
    expect(wallet!.available_balance).toBe(1000);
  });
});
