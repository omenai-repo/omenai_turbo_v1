/**
 * Integration tests for POST /api/transactions/fetchSubTrans
 *
 * Seeds SubscriptionTransactions directly and verifies the route returns
 * the correct records scoped by gallery_id.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";

import { POST } from "../../../app/api/transactions/fetchSubTrans/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/transactions/fetchSubTrans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeSubTx(overrides: Record<string, any> = {}) {
  const id = Math.random().toString(36).slice(2, 10);
  return {
    payment_ref: `ref-${id}`,
    amount: 49,
    date: new Date(),
    gallery_id: "gallery-001",
    status: "successful",
    stripe_customer_id: "cus_test_001",
    ...overrides,
  };
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SubscriptionTransactions.deleteMany({});
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/transactions/fetchSubTrans — success", () => {
  beforeEach(async () => {
    await SubscriptionTransactions.create([
      makeSubTx({ gallery_id: "gallery-001" }),
      makeSubTx({ gallery_id: "gallery-001" }),
      makeSubTx({ gallery_id: "gallery-002" }),
    ]);
  });

  it("returns 200 with subscription transactions for the given gallery", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Transaction fetched");
    expect(body.data).toHaveLength(2);
    expect(body.data.every((t: any) => t.gallery_id === "gallery-001")).toBe(true);
  });

  it("returns only records belonging to the specified gallery", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-002" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].gallery_id).toBe("gallery-002");
  });

  it("returns 200 with empty array when gallery has no subscription transactions", async () => {
    const res = await POST(makeRequest({ gallery_id: "unknown-gallery" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("includes amount and payment_ref in returned records", async () => {
    const res = await POST(makeRequest({ gallery_id: "gallery-001" }));
    const body = await res.json();

    body.data.forEach((tx: any) => {
      expect(tx.amount).toBe(49);
      expect(tx.payment_ref).toBeDefined();
    });
  });
});

describe("POST /api/transactions/fetchSubTrans — validation", () => {
  it("returns 400 when gallery_id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when body is not JSON", async () => {
    const req = new Request("http://localhost/api/transactions/fetchSubTrans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad-json",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
