/**
 * Integration tests for POST /api/wallet/fund_wallet
 *
 * Funds are added to pending_balance (not directly to available_balance).
 */

import { describe, it, expect, afterEach } from "vitest";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { POST } from "../../../app/api/wallet/fund_wallet/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/wallet/fund_wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeWallet(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    owner_id: `artist-fund-${uid}`,
    wallet_id: `wallet-fund-${uid}`,
    base_currency: "USD",
    available_balance: 0,
    pending_balance: 0,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Wallet.deleteMany({});
});

// ── Not found ────────────────────────────────────────────────────────────────

describe("POST /api/wallet/fund_wallet — not found", () => {
  it("returns 404 when no wallet exists for the given owner_id", async () => {
    const res = await POST(makeRequest({ owner_id: "ghost-artist", amount: 500 }));
    expect(res.status).toBe(404);
  });
});

// ── Success ──────────────────────────────────────────────────────────────────

describe("POST /api/wallet/fund_wallet — success", () => {
  it("returns 200 and increments pending_balance by the given amount", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-fund-01", pending_balance: 100 }));

    const res = await POST(makeRequest({ owner_id: "artist-fund-01", amount: 350 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Wallet funded");

    const wallet = await Wallet.findOne({ owner_id: "artist-fund-01" });
    expect(wallet!.pending_balance).toBe(450); // 100 + 350
  });

  it("does NOT touch available_balance when funding", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-fund-02", available_balance: 200, pending_balance: 0 }));

    await POST(makeRequest({ owner_id: "artist-fund-02", amount: 500 }));

    const wallet = await Wallet.findOne({ owner_id: "artist-fund-02" });
    expect(wallet!.available_balance).toBe(200); // unchanged
    expect(wallet!.pending_balance).toBe(500);
  });

  it("can fund a wallet that starts at zero pending_balance", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-fund-zero" }));

    await POST(makeRequest({ owner_id: "artist-fund-zero", amount: 1000 }));

    const wallet = await Wallet.findOne({ owner_id: "artist-fund-zero" });
    expect(wallet!.pending_balance).toBe(1000);
  });

  it("correctly accumulates multiple funding operations", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-fund-accum", pending_balance: 0 }));

    await POST(makeRequest({ owner_id: "artist-fund-accum", amount: 100 }));
    await POST(makeRequest({ owner_id: "artist-fund-accum", amount: 250 }));
    await POST(makeRequest({ owner_id: "artist-fund-accum", amount: 50 }));

    const wallet = await Wallet.findOne({ owner_id: "artist-fund-accum" });
    expect(wallet!.pending_balance).toBe(400);
  });
});
