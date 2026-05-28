/**
 * Integration tests for POST /api/auth/gallery/register
 *
 * Seeds AccountGallery, RejectedGallery, and VerificationCodes documents and
 * verifies the route correctly registers galleries against the real in-memory
 * MongoDB instance. The ConfigCat feature flag and parseRegisterData are mocked
 * so tests remain fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { RejectedGallery } from "@omenai/shared-models/models/auth/RejectedGalleryScema";
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

vi.mock("@omenai/shared-emails/src/models/gallery/sendGalleryMail", () => ({
  sendGalleryMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  enrichRegistrationTracking: vi.fn(),
  extractUserTrackingData: vi.fn().mockReturnValue({}),
}));

import { POST } from "../../../../app/api/auth/gallery/register/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeBody(overrides: Record<string, any> = {}) {
  return {
    name: "Test Gallery",
    email: "gallery@test.com",
    password: "password123",
    phone: "1234567890",
    address: {
      address_line: "123 Art St",
      city: "NY",
      country: "US",
      countryCode: "US",
      state: "New York",
      stateCode: "NY",
      zip: "10001",
    },
    logo: "logo.jpg",
    admin: "Gallery Admin",
    description: "A test gallery",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/gallery/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountGallery.deleteMany({});
  await RejectedGallery.deleteMany({});
  await VerificationCodes.deleteMany({});
  vi.clearAllMocks();
});

// ── Feature flag disabled ─────────────────────────────────────────────────────

describe("POST /api/auth/gallery/register — feature flag disabled", () => {
  it("returns 503 when gallery onboarding feature flag is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);

    const res = await POST(makeRequest(makeBody()));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toBeTruthy();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/gallery/register — validation", () => {
  it("returns 400 when required fields are missing", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Conflict ─────────────────────────────────────────────────────────────────

describe("POST /api/auth/gallery/register — conflict", () => {
  it("returns 409 when gallery email already exists", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    await AccountGallery.create({
      name: "Existing Gallery",
      email: "gallery@test.com",
      password: "hashed",
      gallery_id: "g-001",
      logo: "l.jpg",
      verified: false,
      gallery_verified: false,
      role: "gallery",
      address: { city: "NY", country: "US" },
      description: "existing",
      admin: "Admin",
    });

    const res = await POST(makeRequest(makeBody({ email: "gallery@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toBeTruthy();
  });

  it("returns 409 when email is in the rejected gallery list", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    await RejectedGallery.create({
      name: "Rejected",
      email: "gallery@test.com",
    });

    const res = await POST(makeRequest(makeBody({ email: "gallery@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toBeTruthy();
  });
});

// ── Successful registration ───────────────────────────────────────────────────

describe("POST /api/auth/gallery/register — successful registration", () => {
  it("returns 201 when gallery is successfully registered", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);
    mockParseRegisterData.mockImplementation(async (data: any) => ({
      ...data,
      password: "hashed",
      gallery_id: `gallery-${Math.random().toString(36).slice(2, 8)}`,
      role: "gallery",
    }));

    const res = await POST(makeRequest(makeBody({ email: "new-gallery@test.com", name: "New Gallery" })));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Account successfully registered");
  });
});
