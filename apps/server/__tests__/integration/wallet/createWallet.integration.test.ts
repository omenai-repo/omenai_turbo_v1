/**
 * Integration tests for POST /api/wallet/create_wallet
 *
 * The ConfigCat feature flag `wallet_withdrawal_enabled` is mocked per-test so
 * we can exercise both the enabled and disabled code paths.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockFetchConfigCatValue } = vi.hoisted(() => ({
  mockFetchConfigCatValue: vi.fn(),
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: mockFetchConfigCatValue,
}));

import { POST } from "../../../app/api/wallet/create_wallet/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/wallet/create_wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.clearAllMocks();
  await Wallet.deleteMany({});
});

// ── Feature flag disabled ────────────────────────────────────────────────────

describe("POST /api/wallet/create_wallet — feature flag disabled", () => {
  it("returns 503 Service Unavailable when the wallet feature flag is off", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);

    const res = await POST(makeRequest({ owner_id: "artist-001", base_currency: "USD" }));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toMatch(/temporarily disabled/i);

    const wallet = await Wallet.findOne({ owner_id: "artist-001" });
    expect(wallet).toBeNull();
  });

  it("does not create a wallet even if payload is valid when flag is off", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);

    await POST(makeRequest({ owner_id: "artist-flagoff", base_currency: "NGN" }));

    const count = await Wallet.countDocuments({});
    expect(count).toBe(0);
  });
});

// ── Validation errors ────────────────────────────────────────────────────────

describe("POST /api/wallet/create_wallet — validation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 400 when owner_id is missing", async () => {
    const res = await POST(makeRequest({ base_currency: "USD" }));
    expect(res.status).toBe(400);
    expect(await Wallet.countDocuments({})).toBe(0);
  });

  it("returns 400 when base_currency is missing", async () => {
    const res = await POST(makeRequest({ owner_id: "artist-missing-currency" }));
    expect(res.status).toBe(400);
    expect(await Wallet.countDocuments({})).toBe(0);
  });

  it("returns 400 when the request body is entirely empty", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

// ── Successful creation ──────────────────────────────────────────────────────

describe("POST /api/wallet/create_wallet — successful creation", () => {
  beforeEach(() => {
    mockFetchConfigCatValue.mockResolvedValue(true);
  });

  it("returns 200 and persists the wallet document", async () => {
    const res = await POST(makeRequest({ owner_id: "artist-new-001", base_currency: "USD" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Wallet created");

    const wallet = await Wallet.findOne({ owner_id: "artist-new-001" });
    expect(wallet).not.toBeNull();
    expect(wallet!.base_currency).toBe("USD");
  });

  it("auto-assigns a wallet_id (uuid) on creation", async () => {
    await POST(makeRequest({ owner_id: "artist-uuid-check", base_currency: "GBP" }));

    const wallet = await Wallet.findOne({ owner_id: "artist-uuid-check" });
    expect(wallet!.wallet_id).toBeTruthy();
    expect(typeof wallet!.wallet_id).toBe("string");
    expect(wallet!.wallet_id.length).toBeGreaterThan(8);
  });

  it("initialises available_balance and pending_balance to zero", async () => {
    await POST(makeRequest({ owner_id: "artist-balance-init", base_currency: "EUR" }));

    const wallet = await Wallet.findOne({ owner_id: "artist-balance-init" });
    expect(wallet!.available_balance).toBe(0);
    expect(wallet!.pending_balance).toBe(0);
  });

  it("stores the correct base_currency from the request", async () => {
    await POST(makeRequest({ owner_id: "artist-ngn", base_currency: "NGN" }));

    const wallet = await Wallet.findOne({ owner_id: "artist-ngn" });
    expect(wallet!.base_currency).toBe("NGN");
  });

  it("configcat is queried with the correct flag key", async () => {
    await POST(makeRequest({ owner_id: "artist-flag-key", base_currency: "USD" }));

    expect(mockFetchConfigCatValue).toHaveBeenCalledWith("wallet_withdrawal_enabled", "high");
  });
});
