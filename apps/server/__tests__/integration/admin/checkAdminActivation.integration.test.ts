/**
 * Integration tests for GET /api/admin/check_admin_activation
 *
 * Seeds AdminInviteToken documents and verifies the route correctly checks
 * token activation status against the real in-memory MongoDB instance.
 * Direct collection insertOne is used to bypass Mongoose schema validation
 * where needed.
 */

import { describe, it, expect, afterEach } from "vitest";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";

import { GET } from "../../../app/api/admin/check_admin_activation/route";

// ── Fixture factory ───────────────────────────────────────────────────────────

function makeRequest(id?: string): Request {
  const url = id
    ? `http://localhost/api/admin/check_admin_activation?id=${encodeURIComponent(id)}`
    : "http://localhost/api/admin/check_admin_activation";

  return new Request(url, { method: "GET" });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AdminInviteToken.deleteMany({});
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("GET /api/admin/check_admin_activation — validation", () => {
  it("returns 400 when id query param is missing", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Token not found ───────────────────────────────────────────────────────────

describe("GET /api/admin/check_admin_activation — token not found", () => {
  it("returns isActive: false when token does not exist", async () => {
    const res = await GET(makeRequest("nonexistent-token"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.isActive).toBe(false);
  });
});

// ── Token found ───────────────────────────────────────────────────────────────

describe("GET /api/admin/check_admin_activation — token found", () => {
  it("returns isActive: true when token exists", async () => {
    await AdminInviteToken.collection.insertOne({
      token: "active-token-123",
      email: "admin@test.com",
    });

    const res = await GET(makeRequest("active-token-123"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.isActive).toBe(true);
  });
});
