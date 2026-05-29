/**
 * Integration tests for GET /api/admin/fetch_all_admins
 *
 * Seeds AccountAdmin documents and verifies the route correctly retrieves all
 * admins from the real in-memory MongoDB instance.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";

import { GET } from "../../../app/api/admin/fetch_all_admins/route";

// ── Fixture factory ───────────────────────────────────────────────────────────

let adminCounter = 0;

function makeAdmin(overrides: Record<string, any> = {}) {
  adminCounter += 1;
  return {
    name: "Test Admin",
    email: `admin-${adminCounter}@test.com`,
    access_role: "Admin" as const,
    ...overrides,
  };
}

function makeRequest(): Request {
  return new Request("http://localhost/api/admin/fetch_all_admins", {
    method: "GET",
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountAdmin.deleteMany({});
  adminCounter = 0;
});

// ── No data ───────────────────────────────────────────────────────────────────

describe("GET /api/admin/fetch_all_admins — no data", () => {
  it("returns 200 with empty data array when no admins exist", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});

// ── Data present ──────────────────────────────────────────────────────────────

describe("GET /api/admin/fetch_all_admins — data present", () => {
  it("returns 200 with all admins in the data array", async () => {
    await AccountAdmin.create([
      makeAdmin({ email: "a1@test.com" }),
      makeAdmin({ email: "a2@test.com" }),
    ]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.length).toBe(2);
  });

  it("returns only the selected fields for each admin", async () => {
    await AccountAdmin.create(makeAdmin({ email: "a1@test.com" }));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data[0]).toHaveProperty("name");
    expect(body.data[0]).toHaveProperty("email");
  });

  it("returns the correct message", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body.message).toBe("Successfully fetched all admins");
  });
});
