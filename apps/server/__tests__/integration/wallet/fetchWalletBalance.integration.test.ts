/**
 * Integration tests for GET /api/wallet/fetch_wallet_balance
 */

import { describe, it, expect, afterEach } from "vitest";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { GET } from "../../../app/api/wallet/fetch_wallet_balance/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(ownerId?: string) {
  const url = ownerId
    ? `http://localhost/api/wallet/fetch_wallet_balance?id=${encodeURIComponent(ownerId)}`
    : "http://localhost/api/wallet/fetch_wallet_balance";
  return new Request(url, { method: "GET" });
}

function makeWallet(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    owner_id: `artist-${uid}`,
    wallet_id: `wallet-${uid}`,
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

// ── Validation ───────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet_balance — validation", () => {
  it("returns 400 when ?id is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("returns 400 when ?id is an empty string", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
  });
});

// ── Not found ────────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet_balance — not found", () => {
  it("returns 404 for an owner with no wallet", async () => {
    const res = await GET(makeRequest("ghost-artist"));
    expect(res.status).toBe(404);
  });
});

// ── Success ──────────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet_balance — success", () => {
  it("returns 200 with available, pending and wallet_id fields", async () => {
    const wallet = await Wallet.create(makeWallet({
      owner_id: "balance-artist-01",
      available_balance: 3200,
      pending_balance: 800,
    }));

    const res = await GET(makeRequest("balance-artist-01"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Wallet balance fetched");
    expect(body.balances.available).toBe(3200);
    expect(body.balances.pending).toBe(800);
    expect(body.balances.wallet_id).toBe(wallet.wallet_id);
  });

  it("does NOT expose wallet_pin or applied_payment_refs in the response", async () => {
    await Wallet.create(makeWallet({ owner_id: "balance-private-01", wallet_pin: "hashed-pin" }));

    const res = await GET(makeRequest("balance-private-01"));
    const body = await res.json();

    expect(body.balances.wallet_pin).toBeUndefined();
    expect(body.balances.applied_payment_refs).toBeUndefined();
  });

  it("returns zero balances for a freshly created wallet", async () => {
    await Wallet.create(makeWallet({ owner_id: "new-artist-balance" }));

    const res = await GET(makeRequest("new-artist-balance"));
    const body = await res.json();

    expect(body.balances.available).toBe(0);
    expect(body.balances.pending).toBe(0);
  });
});
