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
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("9876543"),
}));
vi.mock("@omenai/shared-emails/src/models/artist/sendArtistVerifiedMail", () => ({
  sendArtistVerifiedMail: vi.fn().mockResolvedValue(undefined),
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

import { POST } from "../../../../app/api/requests/artist/verify/resend/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/artist/verify/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockArtist = {
  name: "Test Artist",
  email: "artist@example.com",
  verified: false,
};

describe("POST /api/requests/artist/verify/resend", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and resends verification code", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);
    vi.mocked(VerificationCodes.create).mockResolvedValue({} as any);

    const response = await POST(makeRequest({ author: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Verification code resent");
  });

  it("deletes existing token before creating a new one", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtist),
    } as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ code: "oldcode", author: "artist-123" } as any);
    vi.mocked(VerificationCodes.create).mockResolvedValue({} as any);

    await POST(makeRequest({ author: "artist-123" }));

    expect(VerificationCodes.deleteOne).toHaveBeenCalledWith({
      author: "artist-123",
      code: "oldcode",
    });
  });

  it("returns 404 when account name or email is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ name: null, email: null, verified: false }),
    } as any);

    const response = await POST(makeRequest({ author: "ghost-id" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Unable to authenticate account");
  });

  it("returns 403 when account is already verified", async () => {
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      exec: vi.fn().mockResolvedValue({ ...mockArtist, verified: true }),
    } as any);

    const response = await POST(makeRequest({ author: "artist-123" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already verified/i);
  });

  it("returns 400 when author field is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
