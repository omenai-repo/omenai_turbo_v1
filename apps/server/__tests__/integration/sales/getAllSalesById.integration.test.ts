/**
 * Integration tests for POST /api/sales/getAllSalesById
 *
 * Seeds SalesActivity documents and verifies the route returns count and data
 * filtered by id from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";

import { POST } from "../../../app/api/sales/getAllSalesById/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeSalesActivity(overrides: Record<string, any> = {}) {
  return {
    month: "January",
    year: "2024",
    value: 1500,
    id: "gallery-001",
    trans_ref: "txn-001",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/sales/getAllSalesById", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SalesActivity.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/sales/getAllSalesById — validation", () => {
  it("returns 400 when id is missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});

// ── Empty result ──────────────────────────────────────────────────────────────

describe("POST /api/sales/getAllSalesById — empty result", () => {
  it("returns 200 with empty data and count 0 when no matching records exist", async () => {
    const res = await POST(makeRequest({ id: "gallery-nonexistent" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual([]);
    expect(body.count).toBe(0);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/sales/getAllSalesById — success", () => {
  it("returns 200 with the correct count for the given id", async () => {
    await SalesActivity.create([
      makeSalesActivity({ id: "gallery-001", trans_ref: "txn-001" }),
      makeSalesActivity({ id: "gallery-001", trans_ref: "txn-002" }),
      makeSalesActivity({ id: "gallery-001", trans_ref: "txn-003" }),
    ]);

    const res = await POST(makeRequest({ id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(3);
  });

  it("returns data array with matching records", async () => {
    await SalesActivity.create([
      makeSalesActivity({ id: "gallery-001", trans_ref: "txn-001" }),
      makeSalesActivity({ id: "gallery-001", trans_ref: "txn-002" }),
    ]);

    const res = await POST(makeRequest({ id: "gallery-001" }));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
  });

  it("does not include records belonging to other ids in the count", async () => {
    await SalesActivity.create([
      makeSalesActivity({ id: "gallery-001", trans_ref: "txn-001" }),
      makeSalesActivity({ id: "gallery-002", trans_ref: "txn-002" }),
    ]);

    const res = await POST(makeRequest({ id: "gallery-001" }));
    const body = await res.json();

    expect(body.count).toBe(1);
    expect(body.data).toHaveLength(1);
  });
});
