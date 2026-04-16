import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: {
    findOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/codeTimeoutSchema",
  () => ({
    VerificationCodes: {
      findOne: vi.fn(),
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockResolvedValue("1234567"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail",
  () => ({
    sendPasswordRecoveryMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }

  return {
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }

        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../../app/api/auth/individual/sendPasswordResetLink/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { sendPasswordRecoveryMail } from "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail";

const mockUser = {
  user_id: "user-abc-123",
  name: "Test User",
  email: "test@example.com",
  verified: true,
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/auth/individual/sendPasswordResetLink",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function mockFindOneUser(value: typeof mockUser | null) {
  const chain = {
    exec: vi.fn().mockResolvedValue(value),
  };
  vi.mocked(AccountIndividual.findOne).mockReturnValue(chain as any);
}

describe("POST /api/auth/individual/sendPasswordResetLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOneUser(mockUser);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);
    vi.mocked(VerificationCodes.create).mockResolvedValue({
      code: "1234567",
      author: "user-abc-123",
    } as any);
  });

  it("returns 200 with success message when reset link is sent", async () => {
    const response = await POST(
      makeRequest({ recoveryEmail: "test@example.com" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Verification link sent");
  });

  it("calls sendPasswordRecoveryMail with correct arguments", async () => {
    await POST(makeRequest({ recoveryEmail: "test@example.com" }));

    expect(sendPasswordRecoveryMail).toHaveBeenCalledWith({
      name: mockUser.name,
      email: mockUser.email,
      token: "1234567",
      route: "individual",
    });
  });

  it("returns 404 when email is not associated to any account", async () => {
    mockFindOneUser(null);

    const response = await POST(
      makeRequest({ recoveryEmail: "ghost@example.com" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Email is not associated to any account");
  });

  it("returns 403 when account is not verified", async () => {
    mockFindOneUser({ ...mockUser, verified: false });

    const response = await POST(
      makeRequest({ recoveryEmail: "test@example.com" }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe("Please verify your account first.");
  });

  it("returns 403 when an active verification token already exists", async () => {
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({
      code: "9999999",
      author: "user-abc-123",
    } as any);

    const response = await POST(
      makeRequest({ recoveryEmail: "test@example.com" }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe("Token link active. Please visit link to continue");
  });

  it("returns 500 when VerificationCodes.create returns a falsy value", async () => {
    vi.mocked(VerificationCodes.create).mockResolvedValue(null as any);

    const response = await POST(
      makeRequest({ recoveryEmail: "test@example.com" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when recoveryEmail is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when recoveryEmail format is invalid", async () => {
    const response = await POST(
      makeRequest({ recoveryEmail: "not-an-email" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
