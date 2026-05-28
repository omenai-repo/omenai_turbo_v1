/**
 * Integration tests for POST /api/sales/getActivityById
 *
 * Seeds SalesActivity documents and verifies the route returns matching records
 * filtered by id and year from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";

import { POST } from "../../../app/api/sales/getActivityById/route";

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
  return new Request("http://localhost/api/sales/getActivityById", {
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

describe("POST /api/sales/getActivityById — validation", () => {
  it("returns 400 when id is missing", async () => {
    const res = await POST(makeRequest({ year: "2024" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when year is missing", async () => {
    const res = await POST(makeRequest({ id: "gallery-001" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when both id and year are missing", async () => {
    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/sales/getActivityById — success", () => {
  it("returns 200 with empty array when no matching records exist", async () => {
    const res = await POST(makeRequest({ id: "gallery-nonexistent", year: "2024" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual([]);
  });

  it("returns 200 with matching records for the given id and year", async () => {
    await SalesActivity.create([
      makeSalesActivity({ id: "gallery-001", year: "2024", month: "January" }),
      makeSalesActivity({ id: "gallery-001", year: "2024", month: "February", trans_ref: "txn-002" }),
    ]);

    const res = await POST(makeRequest({ id: "gallery-001", year: "2024" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
  });

  it("only returns records matching the queried id", async () => {
    await SalesActivity.create([
      makeSalesActivity({ id: "gallery-001", year: "2024" }),
      makeSalesActivity({ id: "gallery-002", year: "2024", trans_ref: "txn-002" }),
    ]);

    const res = await POST(makeRequest({ id: "gallery-001", year: "2024" }));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("gallery-001");
  });

  it("only returns records matching the queried year", async () => {
    await SalesActivity.create([
      makeSalesActivity({ id: "gallery-001", year: "2024" }),
      makeSalesActivity({ id: "gallery-001", year: "2023", trans_ref: "txn-002" }),
    ]);

    const res = await POST(makeRequest({ id: "gallery-001", year: "2024" }));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].year).toBe("2024");
  });
});
