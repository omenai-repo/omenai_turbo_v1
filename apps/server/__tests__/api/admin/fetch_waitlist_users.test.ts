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
  },
}));

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
    validateGetRouteParams: vi
      .fn()
      .mockImplementation((schema: any, data: any) => {
        const result = schema.safeParse(data);
        if (!result.success)
          throw new BadRequestError("Invalid URL parameters");
        return data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { GET } from "../../../app/api/admin/fetch_waitlist_users/route";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";

function makeRequest(entity?: string): Request {
  const url = entity
    ? `http://localhost/api/admin/fetch_waitlist_users?entity=${entity}`
    : "http://localhost/api/admin/fetch_waitlist_users";
  return new Request(url, { method: "GET" });
}

const mockUsers = [
  { waitlistId: "w-1", name: "Alice", entity: "artist" },
  { waitlistId: "w-2", name: "Bob", entity: "artist" },
];

describe("GET /api/admin/fetch_waitlist_users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with waitlist users for artist entity", async () => {
    vi.mocked(Waitlist.find).mockResolvedValue(mockUsers as any);

    const response = await GET(makeRequest("artist"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successfully fetched all waitlist users");
    expect(body.data).toEqual(mockUsers);
    expect(Waitlist.find).toHaveBeenCalledWith({
      isInvited: false,
      entity: "artist",
    });
  });

  it("returns 200 with waitlist users for gallery entity", async () => {
    vi.mocked(Waitlist.find).mockResolvedValue([] as any);

    const response = await GET(makeRequest("gallery"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when entity param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 400 when entity is not a valid enum value", async () => {
    const response = await GET(makeRequest("collector"));
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
