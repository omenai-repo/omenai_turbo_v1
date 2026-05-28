/**
 * Integration tests for POST /api/auth/gallery/login
 *
 * Seeds an AccountGallery document and verifies the route correctly authenticates
 * the gallery against the real in-memory MongoDB instance. bcrypt.compareSync and
 * the session layer are mocked so tests remain fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

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

import { POST } from "../../../../app/api/auth/gallery/login/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeGallery(overrides: Record<string, any> = {}) {
  return {
    name: "Test Gallery",
    email: "gallery@test.com",
    password: "hashed-password",
    gallery_id: "gallery-001",
    connected_account_id: "acct-001",
    logo: "logo.jpg",
    admin: "Admin",
    description: "desc",
    verified: false,
    gallery_verified: false,
    address: { city: "NY", country: "US" },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/gallery/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountGallery.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/gallery/login — validation", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ password: "pass123" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Authentication failures ───────────────────────────────────────────────────

describe("POST /api/auth/gallery/login — authentication failures", () => {
  it("returns 409 when gallery account does not exist", async () => {
    const res = await POST(
      makeRequest({ email: "nonexistent@test.com", password: "pass123" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });

  it("returns 409 when password does not match", async () => {
    await AccountGallery.create(makeGallery({ email: "gallery@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(false);

    const res = await POST(
      makeRequest({ email: "gallery@test.com", password: "wrong-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });
});

// ── Successful login ──────────────────────────────────────────────────────────

describe("POST /api/auth/gallery/login — successful login", () => {
  it("returns 200 with login successful when credentials are valid", async () => {
    await AccountGallery.create(makeGallery({ email: "gallery@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "gallery@test.com", password: "correct-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Login successful");
  });

  it("email lookup is case-insensitive", async () => {
    await AccountGallery.create(makeGallery({ email: "gallery@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "GALLERY@TEST.COM", password: "pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
