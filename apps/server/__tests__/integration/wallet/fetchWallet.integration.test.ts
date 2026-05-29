/**
 * Integration tests for GET /api/wallet/fetch_wallet
 */

import { describe, it, expect, afterEach } from "vitest";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { GET } from "../../../app/api/wallet/fetch_wallet/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(ownerId?: string) {
  const url = ownerId
    ? `http://localhost/api/wallet/fetch_wallet?id=${encodeURIComponent(ownerId)}`
    : "http://localhost/api/wallet/fetch_wallet";
  return new Request(url, { method: "GET" });
}

function makeWallet(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    owner_id: `artist-${uid}`,
    wallet_id: `wallet-${uid}`,
    base_currency: "USD",
    available_balance: 250,
    pending_balance: 75,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Wallet.deleteMany({});
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet — validation", () => {
  it("returns 400 when the ?id query param is missing entirely", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("returns 400 when the ?id query param is an empty string", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
  });
});

// ── Not found ────────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet — not found", () => {
  it("returns 404 when no wallet exists for the given owner_id", async () => {
    const res = await GET(makeRequest("non-existent-owner"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toMatch(/doesn't exists/i);
  });
});

// ── Success ──────────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet — success", () => {
  it("returns 200 with the full wallet document for an existing owner", async () => {
    const created = await Wallet.create(makeWallet({ owner_id: "artist-fetch-001" }));

    const res = await GET(makeRequest("artist-fetch-001"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Wallet validation fetched");
    expect(body.wallet.owner_id).toBe("artist-fetch-001");
    expect(body.wallet.wallet_id).toBe(created.wallet_id);
  });

  it("returns the correct available_balance and pending_balance", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-balance", available_balance: 500, pending_balance: 120 }));

    const res = await GET(makeRequest("artist-balance"));
    const body = await res.json();

    expect(body.wallet.available_balance).toBe(500);
    expect(body.wallet.pending_balance).toBe(120);
  });

  it("returns the correct base_currency for a non-USD wallet", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-ngn", base_currency: "NGN" }));

    const res = await GET(makeRequest("artist-ngn"));
    const body = await res.json();

    expect(body.wallet.base_currency).toBe("NGN");
  });

  it("only returns the wallet owned by the queried owner_id (no cross-user data)", async () => {
    await Wallet.create(makeWallet({ owner_id: "artist-a", available_balance: 100 }));
    await Wallet.create(makeWallet({ owner_id: "artist-b", available_balance: 9999 }));

    const res = await GET(makeRequest("artist-a"));
    const body = await res.json();

    expect(body.wallet.owner_id).toBe("artist-a");
    expect(body.wallet.available_balance).toBe(100);
  });
});
