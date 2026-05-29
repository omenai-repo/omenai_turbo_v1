/**
 * Integration tests for POST /api/auth/artist/register
 *
 * Seeds AccountArtist and VerificationCodes documents and verifies the route
 * correctly registers artists against the real in-memory MongoDB instance.
 * The ConfigCat feature flag and parseRegisterData are mocked so tests remain
 * fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockFetchConfigCatValue } = vi.hoisted(() => ({
  mockFetchConfigCatValue: vi.fn(),
}));

vi.mock("@omenai/shared-lib/configcat/configCatFetch", () => ({
  fetchConfigCatValue: mockFetchConfigCatValue,
}));

const { mockParseRegisterData } = vi.hoisted(() => ({
  mockParseRegisterData: vi.fn(),
}));

vi.mock("@omenai/shared-lib/auth/parseRegisterData", () => ({
  parseRegisterData: mockParseRegisterData,
}));

vi.mock("@omenai/shared-emails/src/models/artist/sendArtistSignupMail", () => ({
  sendArtistSignupMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  enrichRegistrationTracking: vi.fn(),
  extractUserTrackingData: vi.fn().mockReturnValue({}),
}));

import { POST } from "../../../../app/api/auth/artist/register/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeBody(overrides: Record<string, any> = {}) {
  return {
    name: "Test Artist",
    email: "artist@test.com",
    password: "password123",
    phone: "1234567890",
    art_style: "painting",
    address: {
      address_line: "123 Main St",
      city: "NY",
      country: "US",
      countryCode: "US",
      state: "New York",
      stateCode: "NY",
      zip: "10001",
    },
    logo: "logo.jpg",
    base_currency: "USD",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/artist/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountArtist.deleteMany({});
  await VerificationCodes.deleteMany({});
  vi.clearAllMocks();
});

// ── Feature flag disabled ─────────────────────────────────────────────────────

describe("POST /api/auth/artist/register — feature flag disabled", () => {
  it("returns 503 when artist onboarding feature flag is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);

    const res = await POST(makeRequest(makeBody()));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toBeTruthy();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/artist/register — validation", () => {
  it("returns 400 when required fields are missing", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });

  it("returns 400 when email is invalid", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    const res = await POST(makeRequest(makeBody({ email: "not-an-email" })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Conflict ─────────────────────────────────────────────────────────────────

describe("POST /api/auth/artist/register — conflict", () => {
  it("returns 409 when artist email already exists", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    await AccountArtist.create({
      name: "Existing",
      email: "artist@test.com",
      password: "x",
      artist_id: "a-001",
      logo: "l.jpg",
      verified: false,
      artist_verified: false,
      role: "artist",
      art_style: [],
      address: { city: "NY", country: "US" },
      bio: "bio",
      documentation: {
        cv: "",
        socials: { instagram: "", twitter: "", facebook: "", linkedin: "" },
      },
    });

    const res = await POST(makeRequest(makeBody({ email: "artist@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toBeTruthy();
  });
});

// ── Successful registration ───────────────────────────────────────────────────

describe("POST /api/auth/artist/register — successful registration", () => {
  it("returns 201 when artist is successfully registered", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);
    mockParseRegisterData.mockImplementation(async (data: any) => ({
      ...data,
      password: "hashed-password",
      artist_id: `artist-${crypto.randomUUID()}`,
      role: "artist",
    }));

    const res = await POST(makeRequest(makeBody({ email: "new-artist@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Artist successfully registered");
  });
});
