/**
 * Integration tests for POST /api/wallet/unlock_funds
 *
 * This endpoint moves `amount` from pending_balance to available_balance.
 * It uses an atomic $inc query with a pending_balance >= amount guard.
 */

import { describe, it, expect, afterEach } from "vitest";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { POST } from "../../../app/api/wallet/unlock_funds/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/wallet/unlock_funds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeWallet(overrides: Record<string, any> = {}) {
  const uid = Math.random().toString(36).slice(2, 10);
  return {
    owner_id: `artist-unlock-${uid}`,
    wallet_id: `wallet-unlock-${uid}`,
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

describe("POST /api/wallet/unlock_funds — validation", () => {
  it("returns 400 when owner_id is missing", async () => {
    const res = await POST(makeRequest({ amount: 100 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const res = await POST(makeRequest({ owner_id: "artist-x" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is a string instead of a number", async () => {
    const res = await POST(makeRequest({ owner_id: "artist-x", amount: "100" }));
    expect(res.status).toBe(400);
  });
});

// ── Not found ────────────────────────────────────────────────────────────────

describe("POST /api/wallet/unlock_funds — wallet not found", () => {
  it("returns 404 when no wallet exists for the owner_id", async () => {
    const res = await POST(makeRequest({ owner_id: "ghost-artist", amount: 100 }));
    expect(res.status).toBe(404);
  });
});

// ── Insufficient balance ─────────────────────────────────────────────────────

describe("POST /api/wallet/unlock_funds — insufficient pending_balance", () => {
  it("returns 500 when pending_balance is less than the unlock amount", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-low-pending", pending_balance: 50 }));

    const res = await POST(makeRequest({ owner_id: "artist-low-pending", amount: 200 }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toMatch(/error was encountered/i);

    // Balance must not have changed
    const wallet = await Wallet.findOne({ owner_id: "artist-low-pending" });
    expect(wallet!.pending_balance).toBe(50);
    expect(wallet!.available_balance).toBe(0);
  });

  it("returns 500 when pending_balance is zero and amount > 0", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-zero-pending", pending_balance: 0 }));

    const res = await POST(makeRequest({ owner_id: "artist-zero-pending", amount: 1 }));

    expect(res.status).toBe(500);
  });
});

// ── Successful unlock ────────────────────────────────────────────────────────

describe("POST /api/wallet/unlock_funds — successful unlock", () => {
  it("moves the exact amount from pending_balance to available_balance", async () => {
    await Wallet.create(makeWallet({
      owner_id: "artist-unlock-ok",
      pending_balance: 1000,
      available_balance: 200,
    }));

    const res = await POST(makeRequest({ owner_id: "artist-unlock-ok", amount: 400 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Funds credited to available balance");

    const wallet = await Wallet.findOne({ owner_id: "artist-unlock-ok" });
    expect(wallet!.pending_balance).toBe(600);   // 1000 - 400
    expect(wallet!.available_balance).toBe(600);  // 200 + 400
  });

  it("allows unlocking the entire pending_balance at once", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-full-unlock", pending_balance: 750, available_balance: 0 }));

    await POST(makeRequest({ owner_id: "artist-full-unlock", amount: 750 }));

    const wallet = await Wallet.findOne({ owner_id: "artist-full-unlock" });
    expect(wallet!.pending_balance).toBe(0);
    expect(wallet!.available_balance).toBe(750);
  });

  it("preserves other wallet fields (wallet_id, base_currency) unchanged", async () => {
    const created = await Wallet.create(makeWallet({
      owner_id: "artist-fields-preserved",
      wallet_id: "wallet-fields-preserved",
      base_currency: "GBP",
      pending_balance: 300,
    }));

    await POST(makeRequest({ owner_id: "artist-fields-preserved", amount: 100 }));

    const wallet = await Wallet.findOne({ owner_id: "artist-fields-preserved" });
    expect(wallet!.wallet_id).toBe(created.wallet_id);
    expect(wallet!.base_currency).toBe("GBP");
  });

  it("is safe to call multiple times with correct amounts (sequential unlocks)", async () => {
    await Wallet.create(makeWallet({
      owner_id: "artist-sequential",
      pending_balance: 600,
      available_balance: 0,
    }));

    await POST(makeRequest({ owner_id: "artist-sequential", amount: 200 }));
    await POST(makeRequest({ owner_id: "artist-sequential", amount: 200 }));
    await POST(makeRequest({ owner_id: "artist-sequential", amount: 200 }));

    const wallet = await Wallet.findOne({ owner_id: "artist-sequential" });
    expect(wallet!.pending_balance).toBe(0);
    expect(wallet!.available_balance).toBe(600);
  });
});
