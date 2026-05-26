/**
 * Integration tests for POST /api/transactions/fetchTransaction
 *
 * Seeds PurchaseTransactions directly and verifies the route returns the
 * correct records from the in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

import { POST } from "../../../app/api/transactions/fetchTransaction/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/transactions/fetchTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeTx(overrides: Record<string, any> = {}) {
  const id = Math.random().toString(36).slice(2, 10);
  return {
    trans_reference: `ref-${id}`,
    trans_pricing: { amount_total: 1000, unit_price: 800, commission: 100, shipping_cost: 80, tax_fees: 20, currency: "USD" },
    trans_date: new Date(),
    trans_initiator_id: "buyer-001",
    trans_recipient_id: "seller-001",
    trans_recipient_role: "artist",
    order_id: `order-${id}`,
    status: "successful",
    provider: "flutterwave",
    ...overrides,
  };
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await PurchaseTransactions.deleteMany({});
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/transactions/fetchTransaction — success", () => {
  beforeEach(async () => {
    // Use the raw MongoDB collection to bypass the schema's malformed enum
    // (provider: ["flutterwave, stripe"] is a known schema bug that rejects
    // both "flutterwave" and "stripe" as separate valid values via create()).
    await PurchaseTransactions.collection.insertMany([
      makeTx({ trans_recipient_id: "seller-001" }),
      makeTx({ trans_recipient_id: "seller-001" }),
      makeTx({ trans_recipient_id: "seller-002" }),
    ]);
  });

  it("returns 200 with transactions belonging to the given recipient", async () => {
    const res = await POST(makeRequest({ trans_recipient_id: "seller-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Transaction fetched");
    expect(body.data).toHaveLength(2);
    expect(body.data.every((t: any) => t.trans_recipient_id === "seller-001")).toBe(true);
  });

  it("returns 200 with only the matching recipient's records", async () => {
    const res = await POST(makeRequest({ trans_recipient_id: "seller-002" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].trans_recipient_id).toBe("seller-002");
  });

  it("returns 200 with empty array when no transactions match", async () => {
    const res = await POST(makeRequest({ trans_recipient_id: "unknown-seller" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns transactions sorted by createdAt descending (newest first)", async () => {
    // insertMany bypasses Mongoose auto-timestamps; inject explicit createdAt values
    // so the sort assertion has real dates to compare.
    const now = Date.now();
    await PurchaseTransactions.deleteMany({});
    await PurchaseTransactions.collection.insertMany([
      makeTx({ trans_recipient_id: "seller-001", createdAt: new Date(now - 2000) }),
      makeTx({ trans_recipient_id: "seller-001", createdAt: new Date(now) }),
    ]);

    const res = await POST(makeRequest({ trans_recipient_id: "seller-001" }));
    const body = await res.json();

    const dates = body.data.map((t: any) => new Date(t.createdAt).getTime());
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
  });
});

describe("POST /api/transactions/fetchTransaction — validation", () => {
  it("returns 400 when trans_recipient_id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when body is not JSON", async () => {
    const req = new Request("http://localhost/api/transactions/fetchTransaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
