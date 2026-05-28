/**
 * Integration tests for POST /api/auth/artist/login
 *
 * Seeds an AccountArtist document and verifies the route correctly authenticates
 * the artist against the real in-memory MongoDB instance. bcrypt.compareSync and
 * the session layer are mocked so tests remain fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

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

import { POST } from "../../../../app/api/auth/artist/login/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeArtist(overrides: Record<string, any> = {}) {
  return {
    name: "Test Artist",
    email: "artist@test.com",
    password: "hashed-password",
    artist_id: "artist-001",
    logo: "logo.jpg",
    verified: false,
    artist_verified: false,
    role: "artist",
    art_style: [],
    address: {
      city: "NY",
      country: "US",
      address_line: "",
      countryCode: "US",
      state: "NY",
      stateCode: "NY",
      zip: "10001",
    },
    bio: "test bio",
    documentation: {
      cv: "",
      socials: {
        instagram: "",
        twitter: "",
        facebook: "",
        linkedin: "",
      },
    },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/artist/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/artist/login — validation", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ password: "pass123" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(makeRequest({ email: "artist@test.com" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Authentication failures ───────────────────────────────────────────────────

describe("POST /api/auth/artist/login — authentication failures", () => {
  it("returns 409 when artist account does not exist", async () => {
    const res = await POST(
      makeRequest({ email: "nonexistent@test.com", password: "pass123" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });

  it("returns 409 when password does not match", async () => {
    await AccountArtist.create(makeArtist({ email: "artist@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(false);

    const res = await POST(
      makeRequest({ email: "artist@test.com", password: "wrong-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(409);
  });
});

// ── Successful login ──────────────────────────────────────────────────────────

describe("POST /api/auth/artist/login — successful login", () => {
  it("returns 200 with login successful when credentials are valid", async () => {
    await AccountArtist.create(makeArtist({ email: "artist@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "artist@test.com", password: "correct-pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Login successful");
  });

  it("email lookup is case-insensitive", async () => {
    await AccountArtist.create(makeArtist({ email: "artist@test.com" }));
    mockBcrypt.compareSync.mockReturnValue(true);

    const res = await POST(
      makeRequest({ email: "ARTIST@TEST.COM", password: "pass" }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
