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

vi.mock(
  "@omenai/shared-models/models/auth/verification/codeTimeoutSchema",
  () => ({
    VerificationCodes: {
      findOne: vi.fn(),
      deleteOne: vi.fn(),
    },
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

import { POST } from "../../../../app/api/wallet/pin_recovery/verify_otp_code/route";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/wallet/pin_recovery/verify_otp_code",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const validBody = { artist_id: "artist-123", otp: "7654" };

describe("POST /api/wallet/pin_recovery/verify_otp_code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({
      code: "7654",
      author: "artist-123",
    });
    vi.mocked(VerificationCodes.deleteOne).mockResolvedValue({
      deletedCount: 1,
    } as any);
  });

  it("returns 201 when OTP is verified successfully", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("OTP code validated successfully");
    expect(VerificationCodes.deleteOne).toHaveBeenCalledWith({
      author: "artist-123",
      code: "7654",
    });
  });

  it("returns 400 when OTP code is invalid or expired", async () => {
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Invalid OTP code/i);
  });

  it("returns 500 when deleteOne fails to remove the code", async () => {
    vi.mocked(VerificationCodes.deleteOne).mockResolvedValue({
      deletedCount: 0,
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when artist_id is missing", async () => {
    const response = await POST(makeRequest({ otp: "7654" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when otp is missing", async () => {
    const response = await POST(makeRequest({ artist_id: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
