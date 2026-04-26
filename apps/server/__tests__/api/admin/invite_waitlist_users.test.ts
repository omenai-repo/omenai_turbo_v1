import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
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

vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: {
    find: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));

vi.mock("resend", () => ({
  Resend: class {
    batch = { send: async () => ({ data: {}, error: null }) };
  },
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html>Invite Email</html>"),
}));

vi.mock(
  "@omenai/shared-emails/src/views/admin/InvitationEmail",
  () => ({ default: vi.fn().mockReturnValue(null) }),
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

import { POST } from "../../../app/api/admin/invite_waitlist_users/route";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/invite_waitlist_users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockMatchedUsers = [
  {
    waitlistId: "w-1",
    name: "Alice Gallery",
    email: "alice@gallery.com",
    entity: "gallery",
    inviteCode: "invite-abc",
  },
  {
    waitlistId: "w-2",
    name: "Bob Artist",
    email: "bob@artist.com",
    entity: "artist",
    inviteCode: null,
  },
];

const validBody = {
  waitlistUsers: [
    { waitlistId: "w-1", discount: true },
    { waitlistId: "w-2", discount: false },
  ],
};

describe("POST /api/admin/invite_waitlist_users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Waitlist.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockMatchedUsers),
    } as any);
    vi.mocked(Waitlist.bulkWrite).mockResolvedValue({
      modifiedCount: 2,
      getWriteErrors: vi.fn().mockReturnValue([]),
    } as any);
  });

  it("returns 200 when waitlist users are invited successfully", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully invited waitlist users");
    expect(body.modifiedCount).toBe(2);
  });

  it("calls Waitlist.bulkWrite with correct update operations", async () => {
    await POST(makeRequest(validBody));

    expect(Waitlist.bulkWrite).toHaveBeenCalledOnce();
    const ops = vi.mocked(Waitlist.bulkWrite).mock.calls[0][0];
    expect(ops).toHaveLength(2);
  });

  it("returns 400 when waitlistUsers is not an array", async () => {
    const response = await POST(makeRequest({ waitlistUsers: "not-array" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when waitlistId is missing from a user", async () => {
    const response = await POST(
      makeRequest({ waitlistUsers: [{ discount: true }] }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
