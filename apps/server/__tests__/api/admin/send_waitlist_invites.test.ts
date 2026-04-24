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

vi.mock(
  "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel",
  () => ({
    default: {
      find: vi.fn(),
    },
  }),
);

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    batch: { send: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  })),
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html>Invite Email</html>"),
}));

vi.mock(
  "@omenai/shared-emails/src/views/admin/SendArtistWaitListInvites",
  () => ({ default: vi.fn().mockReturnValue(null) }),
);

vi.mock(
  "@omenai/shared-emails/src/views/admin/SendCollectorWaitlistInvite",
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

import { POST } from "../../../app/api/admin/send_waitlist_invites/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/admin/send_waitlist_invites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockLeads = [
  { name: "Alice Artist", email: "alice@example.com", entity: "artist" },
  { name: "Bob Collector", email: "bob@example.com", entity: "collector" },
];

const validBody = {
  selectedUsers: [
    { name: "Alice Artist", email: "alice@example.com", entity: "artist" },
    { name: "Bob Collector", email: "bob@example.com", entity: "collector" },
  ],
};

describe("POST /api/admin/send_waitlist_invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(WaitlistLead.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLeads),
    } as any);
  });

  it("returns 200 when waitlist invites are sent successfully", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Successfully invited waitlist users");
  });

  it("returns 400 when selectedUsers is not an array", async () => {
    const response = await POST(makeRequest({ selectedUsers: "invalid" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when entity is not a valid enum value", async () => {
    const response = await POST(
      makeRequest({
        selectedUsers: [
          { name: "Test", email: "test@example.com", entity: "gallery" },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when email is invalid", async () => {
    const response = await POST(
      makeRequest({
        selectedUsers: [
          { name: "Test", email: "not-an-email", entity: "artist" },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
