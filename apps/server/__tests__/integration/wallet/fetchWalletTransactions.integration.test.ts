/**
 * Integration tests for GET /api/wallet/fetch_wallet_transactions
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { GET } from "../../../app/api/wallet/fetch_wallet_transactions/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

const WALLET_ID = "wallet-tx-test-001";
const YEAR = 2025;

function makeUrl(params: Record<string, string | undefined>) {
  const url = new URL("http://localhost/api/wallet/fetch_wallet_transactions");
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) url.searchParams.set(key, val);
  }
  return url.toString();
}

function makeRequest(params: Record<string, string | undefined>) {
  return new Request(makeUrl(params), { method: "GET" });
}

function makeTx(overrides: Record<string, any> = {}) {
  const flwId = crypto.randomUUID();
  return {
    wallet_id: WALLET_ID,
    trans_amount: 100,
    trans_status: "SUCCESSFUL",
    trans_date: { year: YEAR, month: 1, day: 10 },
    trans_flw_ref_id: flwId,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await WalletTransaction.deleteMany({});
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet_transactions — validation", () => {
  it("returns 200 with empty data when wallet_id (?id) is missing (defaults to empty string)", async () => {
    const res = await GET(makeRequest({ year: String(YEAR) }));
    const body = await res.json();
    // Route defaults missing params to "" — empty string passes z.string(), wallet_id="" matches nothing
    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 200 with empty data when year is missing (defaults to empty string → year 0, no matches)", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID }));
    const body = await res.json();
    // Route defaults missing year to "" → Number("") = 0 (not NaN) → query year=0 → no matches
    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when year is not a number", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: "not-a-year" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when limit is not numeric", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR), limit: "abc" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when status is an unrecognised value", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR), status: "invalid-status" }));
    expect(res.status).toBe(400);
  });
});

// ── Empty results ────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet_transactions — empty results", () => {
  it("returns 200 with an empty array when no transactions exist for the wallet", async () => {
    const res = await GET(makeRequest({ id: "wallet-empty", year: String(YEAR) }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.pageCount).toBe(0);
  });
});

// ── Success ──────────────────────────────────────────────────────────────────

describe("GET /api/wallet/fetch_wallet_transactions — success", () => {
  beforeEach(async () => {
    await WalletTransaction.create(makeTx({ trans_status: "SUCCESSFUL", trans_date: { year: YEAR, month: 3, day: 5 } }));
    await WalletTransaction.create(makeTx({ trans_status: "PENDING", trans_date: { year: YEAR, month: 2, day: 1 } }));
    await WalletTransaction.create(makeTx({ trans_status: "FAILED", trans_date: { year: YEAR, month: 1, day: 20 } }));
    // A different year — must NOT appear
    await WalletTransaction.create(makeTx({ trans_date: { year: 2024, month: 12, day: 31 } }));
  });

  it("returns all transactions for the specified year", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR) }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(3);
    expect(body.data.every((tx: any) => tx.wallet_id === WALLET_ID)).toBe(true);
  });

  it("filters by status=successful correctly (case insensitive)", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR), status: "successful" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.every((tx: any) => tx.trans_status === "SUCCESSFUL")).toBe(true);
  });

  it("filters by status=pending correctly", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR), status: "pending" }));
    const body = await res.json();

    expect(body.data.every((tx: any) => tx.trans_status === "PENDING")).toBe(true);
  });

  it("returns all transactions when status=all", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR), status: "all" }));
    const body = await res.json();

    expect(body.data).toHaveLength(3);
  });

  it("respects the ?limit param to cap results", async () => {
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR), limit: "2" }));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
  });

  it("returns a correct pageCount based on total document count", async () => {
    // 3 transactions, 10 per page → ceil(3/10) = 1
    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR) }));
    const body = await res.json();

    expect(body.pageCount).toBe(1);
  });

  it("does NOT return transactions from another wallet_id", async () => {
    await WalletTransaction.create(makeTx({ wallet_id: "other-wallet", trans_status: "SUCCESSFUL" }));

    const res = await GET(makeRequest({ id: WALLET_ID, year: String(YEAR) }));
    const body = await res.json();

    expect(body.data.every((tx: any) => tx.wallet_id === WALLET_ID)).toBe(true);
    expect(body.data).toHaveLength(3); // the extra one should not appear
  });
});
