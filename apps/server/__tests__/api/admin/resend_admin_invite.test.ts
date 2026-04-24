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

vi.mock("@omenai/shared-models/models/auth/AccountAdmin", () => ({
  AccountAdmin: {
    findOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema",
  () => ({
    AdminInviteToken: {
      findOne: vi.fn(),
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-utils/src/generateToken", () => ({
  generateAlphaDigit: vi.fn().mockReturnValue("new-token-xyz"),
}));

vi.mock(
  "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail",
  () => ({
    sendMemberInviteEmail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../app/api/util", () => {
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

import { POST } from "../../../app/api/admin/resend_admin_invite/route";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
import { sendMemberInviteEmail } from "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/resend_admin_invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAdmin = {
  email: "unverified@example.com",
  verified: false,
};

describe("POST /api/admin/resend_admin_invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(mockAdmin);
    vi.mocked(AdminInviteToken.findOne).mockResolvedValue(null);
    vi.mocked(AdminInviteToken.create).mockResolvedValue({} as any);
  });

  it("returns 201 when invite is resent successfully", async () => {
    const response = await POST(makeRequest({ admin_id: "admin-123" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Invite resent successfully");
    expect(sendMemberInviteEmail).toHaveBeenCalledWith({
      email: mockAdmin.email,
      token: "new-token-xyz",
    });
  });

  it("returns 403 when admin does not exist", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ admin_id: "ghost-admin" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/Invalid operation/i);
  });

  it("returns 403 when admin is already verified", async () => {
    vi.mocked(AccountAdmin.findOne).mockResolvedValue({
      ...mockAdmin,
      verified: true,
    });

    const response = await POST(makeRequest({ admin_id: "admin-123" }));
    const body = await response.json();

    expect(response.status).toBe(403);
  });

  it("returns 400 when an active invite token already exists", async () => {
    vi.mocked(AdminInviteToken.findOne).mockResolvedValue({
      token: "existing-token",
      author: "unverified@example.com",
    });

    const response = await POST(makeRequest({ admin_id: "admin-123" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Invitation link still active/i);
  });

  it("returns 400 when admin_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
