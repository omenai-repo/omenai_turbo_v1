/**
 * Integration tests for POST /api/auth/admin/login
 *
 * Seeds an AccountAdmin document and verifies the route correctly authenticates
 * the admin against the real in-memory MongoDB instance. bcrypt.compareSync and
 * the session layer are mocked so tests remain fast and deterministic.
 *
 * Extra behaviour: unverified admin accounts are rejected with a 403 before
 * the password check is performed.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockBcrypt } = vi.hoisted(() => ({
  mockBcrypt: { compareSync: vi.fn() },
}));

vi.mock("bcrypt", () => ({
  default: mockBcrypt,
  compareSync: mockBcrypt.compareSync,
}));

const { mockCreateSession, mockGetSessionFromCookie } = vi.hoisted(() => ({
  mockCreateSession: vi.fn().mockResolvedValue("session-id-123"),
  mockGetSessionFromCookie: vi
    .fn()
    .mockResolvedValue({ sessionId: null, save: vi.fn() }),
}));

vi.mock("@omenai/shared-lib/auth/session", () => ({
  createSession: mockCreateSession,
  getSessionFromCookie: mockGetSessionFromCookie,
  destroySession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  enrichRegistrationTracking: vi.fn(),
  extractUserTrackingData: vi.fn().mockReturnValue({}),
}));

import { POST } from "../../../../app/api/auth/admin/login/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeAdmin(overrides: Record<string, any> = {}) {
  return {
    name: "Test Admin",
    email: "admin@test.com",
    password: "hashed-password",
    access_role: "Admin",
    verified: true,
    admin_active: true,
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountAdmin.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/admin/login — validation", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ password: "pass123" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Authentication failures ───────────────────────────────────────────────────

describe("POST /api/auth/admin/login — authentication failures", () => {
  it("returns 409 when admin account does not exist", async () => {
    const res = await POST(
      makeRequest({ email: "nonexistent@test.com", password: "pass123" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });

  it("returns 403 when admin account is not verified", async () => {
    await AccountAdmin.create(
      makeAdmin({ email: "admin@test.com", verified: false }),
    );
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "admin@test.com", password: "pass123" }),
    );
    const body = await res.json();

    expect(res.status).toBe(403);
  });

  it("returns 409 when password does not match", async () => {
    await AccountAdmin.create(
      makeAdmin({ email: "admin@test.com", verified: true }),
    );
    mockBcrypt.compareSync.mockReturnValue(false);

    const res = await POST(
      makeRequest({ email: "admin@test.com", password: "wrong-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });
});

// ── Successful login ──────────────────────────────────────────────────────────

describe("POST /api/auth/admin/login — successful login", () => {
  it("returns 200 with login successful when admin is verified and credentials match", async () => {
    await AccountAdmin.create(
      makeAdmin({ email: "admin@test.com", verified: true }),
    );
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "admin@test.com", password: "correct-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Login successful");
  });
});
