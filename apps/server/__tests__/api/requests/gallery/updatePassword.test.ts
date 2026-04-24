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
  connectMongoDB: vi.fn().mockResolvedValue({
    startSession: vi.fn().mockResolvedValue({
      startTransaction: vi.fn(),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      abortTransaction: vi.fn().mockResolvedValue(undefined),
      endSession: vi.fn(),
    }),
  }),
}));
vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
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

import { POST } from "../../../../app/api/requests/gallery/updatePassword/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import bcrypt from "bcrypt";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/gallery/updatePassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAccount = { password: "$2b$10$old_hashed" };
const validBody = { id: "gallery-123", password: "NewPass123!", code: "abc1234" };

describe("POST /api/requests/gallery/updatePassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 when password is updated successfully", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ code: "abc1234" } as any);
    vi.mocked(bcrypt.compareSync).mockReturnValue(false as never);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Password updated successfully");
  });

  it("returns 500 when account is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue(null as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toMatch(/No valid user account/i);
  });

  it("returns 409 when verification code is invalid", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Code invalid, please try again");
  });

  it("returns 409 when new password matches current password", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ code: "abc1234" } as any);
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as never);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toMatch(/identical/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
