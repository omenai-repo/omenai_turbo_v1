/**
 * Integration tests for POST /api/sales/activity
 *
 * Seeds SalesActivity documents and verifies the route creates them in the
 * real in-memory MongoDB instance and returns a 200 confirmation message.
 */

import { describe, it, expect, afterEach } from "vitest";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";

import { POST } from "../../../app/api/sales/activity/route";

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
  return new Request("http://localhost/api/sales/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await SalesActivity.deleteMany({});
});

// ── Success ───────────────────────────────────────────────────────────────────

describe("POST /api/sales/activity — success", () => {
  it("returns 200 with 'Sales data added' message", async () => {
    const res = await POST(makeRequest(makeSalesActivity()));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Sales data added");
  });

  it("persists the sales document in the database", async () => {
    await POST(makeRequest(makeSalesActivity({ id: "gallery-999", trans_ref: "txn-999" })));

    const doc = await SalesActivity.findOne({ id: "gallery-999" });
    expect(doc).not.toBeNull();
    expect(doc!.trans_ref).toBe("txn-999");
  });

  it("stores the correct month and year on the saved document", async () => {
    await POST(makeRequest(makeSalesActivity({ month: "March", year: "2025" })));

    const doc = await SalesActivity.findOne({ month: "March", year: "2025" });
    expect(doc).not.toBeNull();
    expect(doc!.value).toBe(1500);
  });

  it("stores the correct value on the saved document", async () => {
    await POST(makeRequest(makeSalesActivity({ value: 4200 })));

    const doc = await SalesActivity.findOne({ value: 4200 });
    expect(doc).not.toBeNull();
  });
});
