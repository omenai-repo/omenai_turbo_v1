/**
 * Integration tests for POST /api/wallet/update_wallet_pin
 *
 * bcrypt runs for real here (tests are intentionally a bit slower) to verify
 * the full pin-hashing lifecycle: storage, comparison, and rejection logic.
 */

import { describe, it, expect, afterEach } from "vitest";
import bcrypt from "bcrypt";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { POST } from "../../../app/api/wallet/update_wallet_pin/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/wallet/update_wallet_pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeWallet(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    owner_id: `artist-${uid}`,
    wallet_id: `wallet-pin-${uid}`,
    base_currency: "USD",
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Wallet.deleteMany({});
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("POST /api/wallet/update_wallet_pin — validation", () => {
  it("returns 400 when wallet_id is missing", async () => {
    const res = await POST(makeRequest({ pin: "3819" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when pin is missing", async () => {
    const res = await POST(makeRequest({ wallet_id: "wallet-pin-001" }));
    expect(res.status).toBe(400);
  });
});

// ── Repeating / consecutive pin rejection ────────────────────────────────────

describe("POST /api/wallet/update_wallet_pin — weak pin rejection", () => {
  it("returns 403 for a repeating pin (e.g. '1111')", async () => {
    await Wallet.create(makeWallet({ wallet_id: "wallet-weak-001" }));

    const res = await POST(makeRequest({ wallet_id: "wallet-weak-001", pin: "1111" }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toMatch(/repeating or consecutive/i);
  });

  it("returns 403 for a consecutive pin (e.g. '1234')", async () => {
    await Wallet.create(makeWallet({ wallet_id: "wallet-consec-001" }));

    const res = await POST(makeRequest({ wallet_id: "wallet-consec-001", pin: "1234" }));

    expect(res.status).toBe(403);
  });

  it("returns 403 for descending consecutive pin (e.g. '4321')", async () => {
    await Wallet.create(makeWallet({ wallet_id: "wallet-desc-001" }));

    const res = await POST(makeRequest({ wallet_id: "wallet-desc-001", pin: "4321" }));

    expect(res.status).toBe(403);
  });
});

// ── Wallet not found ─────────────────────────────────────────────────────────

describe("POST /api/wallet/update_wallet_pin — wallet not found", () => {
  it("returns 404 when no wallet matches the given wallet_id", async () => {
    const res = await POST(makeRequest({ wallet_id: "ghost-wallet", pin: "7391" }));
    expect(res.status).toBe(404);
  });
});

// ── Same pin conflict ────────────────────────────────────────────────────────

describe("POST /api/wallet/update_wallet_pin — duplicate pin rejection", () => {
  it("returns 409 when the new pin matches the existing wallet pin", async () => {
    const existingPin = "3819";
    const hashedPin = await bcrypt.hash(existingPin, 10);
    const wallet = await Wallet.create(makeWallet({ wallet_id: "wallet-dup-001", wallet_pin: hashedPin }));

    const res = await POST(makeRequest({ wallet_id: wallet.wallet_id, pin: existingPin }));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toMatch(/identical/i);
  });
});

// ── Successful update ────────────────────────────────────────────────────────

describe("POST /api/wallet/update_wallet_pin — successful update", () => {
  it("returns 201 and stores a bcrypt-hashed pin when setting a pin for the first time", async () => {
    const wallet = await Wallet.create(makeWallet({ wallet_id: "wallet-first-pin" }));

    const res = await POST(makeRequest({ wallet_id: wallet.wallet_id, pin: "7391" }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Wallet pin updated successfully");

    const updated = await Wallet.findOne({ wallet_id: wallet.wallet_id });
    expect(updated!.wallet_pin).toBeTruthy();
    // Ensure the stored value is a bcrypt hash, not plaintext
    expect(updated!.wallet_pin).toMatch(/^\$2[aby]\$/);
    // And it verifies correctly
    const isValid = await bcrypt.compare("7391", updated!.wallet_pin!);
    expect(isValid).toBe(true);
  });

  it("returns 201 and replaces the old pin when updating an existing one", async () => {
    const oldPin = "5280";
    const hashedOld = await bcrypt.hash(oldPin, 10);
    const wallet = await Wallet.create(makeWallet({ wallet_id: "wallet-replace-pin", wallet_pin: hashedOld }));

    const res = await POST(makeRequest({ wallet_id: wallet.wallet_id, pin: "9462" }));
    expect(res.status).toBe(201);

    const updated = await Wallet.findOne({ wallet_id: wallet.wallet_id });
    const oldPinStillValid = await bcrypt.compare(oldPin, updated!.wallet_pin!);
    const newPinValid = await bcrypt.compare("9462", updated!.wallet_pin!);

    expect(oldPinStillValid).toBe(false);
    expect(newPinValid).toBe(true);
  });

  it("does not change available_balance or pending_balance during pin update", async () => {
    const wallet = await Wallet.create(makeWallet({
      wallet_id: "wallet-bal-unchanged",
      available_balance: 5000,
      pending_balance: 1200,
    }));

    await POST(makeRequest({ wallet_id: wallet.wallet_id, pin: "8529" }));

    const updated = await Wallet.findOne({ wallet_id: wallet.wallet_id });
    expect(updated!.available_balance).toBe(5000);
    expect(updated!.pending_balance).toBe(1200);
  });
});
