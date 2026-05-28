/**
 * Integration tests for POST /api/auth/individual/register
 *
 * Seeds AccountIndividual and VerificationCodes documents and verifies the route
 * correctly registers individual collectors against the real in-memory MongoDB
 * instance. The ConfigCat feature flag and parseRegisterData are mocked so
 * tests remain fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
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

vi.mock(
  "@omenai/shared-emails/src/models/individuals/sendIndividualMail",
  () => ({
    sendIndividualMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/shared-lib/analytics/extractTrackingData", () => ({
  enrichRegistrationTracking: vi.fn(),
  extractUserTrackingData: vi.fn().mockReturnValue({}),
}));

import { POST } from "../../../../app/api/auth/individual/register/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeBody(overrides: Record<string, any> = {}) {
  return {
    name: "Test User",
    email: "user@test.com",
    password: "password123",
    phone: "1234567890",
    address: {
      address_line: "123 Main St",
      city: "NY",
      country: "US",
      countryCode: "US",
      state: "NY",
      stateCode: "NY",
      zip: "10001",
    },
    preferences: ["modern", "abstract"],
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/individual/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountIndividual.deleteMany({});
  await VerificationCodes.deleteMany({});
  vi.clearAllMocks();
});

// ── Feature flag disabled ─────────────────────────────────────────────────────

describe("POST /api/auth/individual/register — feature flag disabled", () => {
  it("returns 503 when collector onboarding feature flag is disabled", async () => {
    mockFetchConfigCatValue.mockResolvedValue(false);

    const res = await POST(makeRequest(makeBody()));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.message).toBeTruthy();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("POST /api/auth/individual/register — validation", () => {
  it("returns 400 when required fields are missing", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    const res = await POST(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBeTruthy();
  });
});

// ── Conflict ─────────────────────────────────────────────────────────────────

describe("POST /api/auth/individual/register — conflict", () => {
  it("returns 409 when individual email already exists", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);

    await AccountIndividual.create({
      name: "Existing User",
      email: "user@test.com",
      password: "hashed",
      user_id: "user-001",
      verified: false,
      preferences: [],
      role: "user",
      address: { city: "NY", country: "US" },
    });

    const res = await POST(makeRequest(makeBody({ email: "user@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.message).toBeTruthy();
  });
});

// ── Successful registration ───────────────────────────────────────────────────

describe("POST /api/auth/individual/register — successful registration", () => {
  it("returns 201 when user is successfully registered", async () => {
    mockFetchConfigCatValue.mockResolvedValue(true);
    mockParseRegisterData.mockImplementation(async (data: any) => ({
      ...data,
      password: "hashed",
      user_id: `user-${Math.random().toString(36).slice(2, 8)}`,
      role: "user",
    }));

    const res = await POST(makeRequest(makeBody({ email: "new-user@test.com" })));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("User successfully registered");
  });
});
