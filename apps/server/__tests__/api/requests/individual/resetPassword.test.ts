import { describe, it, expect, vi, beforeEach } from "vitest";

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
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/auth/IndividualSchema", () => ({
  AccountIndividual: {
    findOne: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    findOneAndDelete: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("bcrypt", () => ({
  default: { compareSync: vi.fn() },
}));
vi.mock("@omenai/shared-lib/hash/hashPassword", () => ({
  hashPassword: vi.fn().mockResolvedValue("$2b$10$hashed_new"),
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));
vi.mock("../../../../app/api/requests/utils", async () => {
  const z = (await import("zod")).default;
  return {
    ResetPasswordSchema: z.object({ password: z.string(), id: z.string() }),
  };
});
vi.mock("../../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }
  return {
    validateRequestBody: vi.fn().mockImplementation(async (request: Request, schema: any) => {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new BadRequestError("Invalid JSON syntax: Request body could not be parsed.");
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

import { POST } from "../../../../app/api/requests/individual/resetPassword/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import bcrypt from "bcrypt";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/individual/resetPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAccount = { password: "$2b$10$old_hashed" };

describe("POST /api/requests/individual/resetPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when password is reset successfully", async () => {
    vi.mocked(VerificationCodes.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ author: "user-123", code: "tok1234" }),
    } as any);
    vi.mocked(AccountIndividual.findOne).mockReturnValue(mockAccount as any);
    vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

    const response = await POST(makeRequest({ password: "NewPass123!", id: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Password updated! Please login with new credentials.");
  });

  it("returns 400 when token is invalid", async () => {
    vi.mocked(VerificationCodes.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await POST(makeRequest({ password: "NewPass123!", id: "badtoken" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Token invalid. This link is not usable");
  });

  it("returns 404 when no account is associated with the token", async () => {
    vi.mocked(VerificationCodes.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ author: "ghost-id", code: "tok1234" }),
    } as any);
    vi.mocked(AccountIndividual.findOne).mockReturnValue(null as any);

    const response = await POST(makeRequest({ password: "NewPass123!", id: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Invalid request. No account associated with this token.");
  });

  it("returns 409 when new password is the same as old password", async () => {
    vi.mocked(VerificationCodes.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ author: "user-123", code: "tok1234" }),
    } as any);
    vi.mocked(AccountIndividual.findOne).mockReturnValue(mockAccount as any);
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

    const response = await POST(makeRequest({ password: "SamePass!", id: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toMatch(/identical/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ id: "tok1234" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
