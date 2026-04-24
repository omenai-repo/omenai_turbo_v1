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
vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: {
    findOne: vi.fn(),
  },
}));
vi.mock("@omenai/shared-models/models/auth/verification/codeTimeoutSchema", () => ({
  VerificationCodes: {
    findOne: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateDigit: vi.fn().mockReturnValue("1111111"),
}));
vi.mock("@omenai/shared-emails/src/models/gallery/sendPasswordChangeConfirmationCode", () => ({
  sendPasswordConfirmationCodeMail: vi.fn().mockResolvedValue(undefined),
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

import { POST } from "../../../../app/api/requests/gallery/requestPasswordConfirmationCode/route";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/requests/gallery/requestPasswordConfirmationCode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAccount = {
  gallery_id: "gallery-123",
  admin: "Jane Smith",
  email: "gallery@example.com",
};

describe("POST /api/requests/gallery/requestPasswordConfirmationCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and sends confirmation code", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Confirmation code sent to email address");
  });

  it("returns 404 when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ id: "nonexistent" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Gallery not found for given ID");
  });

  it("returns 409 when a token is already active", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockAccount as any);
    vi.mocked(VerificationCodes.findOne).mockResolvedValue({ code: "existing", author: "gallery-123" } as any);

    const response = await POST(makeRequest({ id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toBe("Token active, check your email or try later");
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
