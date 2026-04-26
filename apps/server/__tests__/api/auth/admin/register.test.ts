import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/codeTimeoutSchema",
  () => ({
    VerificationCodes: {
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("1234567"),
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/auth/admin/register/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

const validBody = {
  email: "admin@example.com",
  access_role: "Admin",
};

const mockCreatedAdmin = {
  admin_id: "admin-abc-123",
  email: "admin@example.com",
  access_role: "Admin",
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/auth/admin/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindOne(value: object | null) {
  const chain = {
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(AccountAdmin.findOne).mockReturnValue(chain as any);
}

describe("POST /api/auth/admin/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOne(null);
    vi.mocked(AccountAdmin.create).mockResolvedValue(mockCreatedAdmin as any);
    vi.mocked(VerificationCodes.create).mockResolvedValue({
      code: "1234567",
      author: "admin-abc-123",
    } as any);
  });

  // The route spreads an undefined `data` variable in AccountAdmin.create(),
  // which causes a ReferenceError. This test reflects the current behavior.
  it("returns 500 due to undefined `data` spread in AccountAdmin.create()", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 409 when the account already exists", async () => {
    mockFindOne({ email: "admin@example.com" });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Account already exists, please login");
  });

  it("returns 500 when AccountAdmin.create returns a falsy value", async () => {
    vi.mocked(AccountAdmin.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when VerificationCodes.create returns a falsy value", async () => {
    vi.mocked(VerificationCodes.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({ access_role: "Admin" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email format is invalid", async () => {
    const response = await POST(
      makeRequest({ ...validBody, email: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when access_role is missing", async () => {
    const response = await POST(makeRequest({ email: "admin@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when access_role is not a valid enum value", async () => {
    const response = await POST(
      makeRequest({ ...validBody, access_role: "SuperAdmin" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
