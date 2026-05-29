/**
 * Integration tests for POST /api/auth/individual/login
 *
 * Seeds an AccountIndividual document and verifies the route correctly
 * authenticates the user against the real in-memory MongoDB instance.
 * bcrypt.compareSync and the session layer are mocked so tests remain
 * fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

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

import { POST } from "../../../../app/api/auth/individual/login/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeIndividual(overrides: Record<string, any> = {}) {
  return {
    name: "Test User",
    email: "user@test.com",
    password: "hashed-password",
    user_id: "user-001",
    verified: false,
    preferences: [],
    role: "user",
    address: {
      city: "NY",
      country: "US",
      address_line: "",
      countryCode: "US",
      state: "NY",
      stateCode: "NY",
      zip: "10001",
    },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/individual/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountIndividual.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/individual/login — validation", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ password: "pass123" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Authentication failures ───────────────────────────────────────────────────

describe("POST /api/auth/individual/login — authentication failures", () => {
  it("returns 409 when user account does not exist", async () => {
    const res = await POST(
      makeRequest({ email: "nonexistent@test.com", password: "pass123" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });

  it("returns 409 when password does not match", async () => {
    await AccountIndividual.create(makeIndividual({ email: "user@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(false);

    const res = await POST(
      makeRequest({ email: "user@test.com", password: "wrong-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });
});

// ── Successful login ──────────────────────────────────────────────────────────

describe("POST /api/auth/individual/login — successful login", () => {
  it("returns 200 with login successful when credentials are valid", async () => {
    await AccountIndividual.create(makeIndividual({ email: "user@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "user@test.com", password: "correct-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Login successful");
  });

  it("returns session payload with user_id and role in data", async () => {
    await AccountIndividual.create(
      makeIndividual({ email: "user@test.com", user_id: "user-001", role: "user" }),
    );
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "user@test.com", password: "correct-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.user_id).toBe("user-001");
    expect(body.data.role).toBe("user");
  });
});
