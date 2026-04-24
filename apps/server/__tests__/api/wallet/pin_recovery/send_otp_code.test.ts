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

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/codeTimeoutSchema",
  () => ({
    VerificationCodes: {
      findOne: vi.fn(),
      deleteOne: vi.fn(),
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("7654"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/wallet/sendPinUpdateCode",
  () => ({
    sendPinUpdateCode: vi.fn().mockResolvedValue(undefined),
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

import { POST } from "../../../../app/api/wallet/pin_recovery/send_otp_code/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { sendPinUpdateCode } from "@omenai/shared-emails/src/models/wallet/sendPinUpdateCode";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/wallet/pin_recovery/send_otp_code",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const mockArtist = {
  artist_id: "artist-123",
  name: "Test Artist",
  email: "artist@example.com",
};

describe("POST /api/wallet/pin_recovery/send_otp_code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);
    vi.mocked(VerificationCodes.create).mockResolvedValue({
      code: "7654",
      author: "artist-123",
    } as any);
  });

  it("returns 200 when OTP is sent successfully", async () => {
    const response = await POST(makeRequest({ artist_id: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Pin reset otp code sent to email address");
    expect(sendPinUpdateCode).toHaveBeenCalledWith({
      username: mockArtist.name,
      token: "7654",
      email: mockArtist.email,
    });
  });

  it("deletes existing code before creating a new one", async () => {
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({
      code: "1111",
      author: "artist-123",
    });

    await POST(makeRequest({ artist_id: "artist-123" }));

    expect(VerificationCodes.deleteOne).toHaveBeenCalledWith({
      author: "artist-123",
    });
  });

  it("returns 404 when artist is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ artist_id: "ghost-artist" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Artist not found/i);
  });

  it("returns 500 when VerificationCodes.create fails", async () => {
    vi.mocked(VerificationCodes.create).mockResolvedValue(null as any);

    const response = await POST(makeRequest({ artist_id: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when artist_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
