import { describe, it, expect, vi, beforeEach } from "vitest";

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
  },
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
    validateGetRouteParams: vi.fn().mockImplementation((schema: any, data: any) => {
      const result = schema.safeParse(data);
      if (!result.success) throw new BadRequestError("Invalid URL parameters");
      return data;
    }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { GET } from "../../../../app/api/requests/individual/getUser/route";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

const mockUser = {
  user_id: "user-123",
  name: "Test User",
  email: "user@example.com",
  address: { city: "London" },
  preferences: ["painting"],
  verified: true,
  phone: "+1234567890",
};

function makeGetRequest(id?: string): unknown {
  const url = `http://localhost/api/requests/individual/getUser${id ? `?id=${id}` : ""}`;
  return { nextUrl: new URL(url) };
}

function mockFindOne(value: typeof mockUser | null) {
  vi.mocked(AccountIndividual.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("GET /api/requests/individual/getUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with user profile data", async () => {
    mockFindOne(mockUser);

    const response = await GET(makeGetRequest("user-123") as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile retrieved successfully");
    expect(body.user.name).toBe("Test User");
    expect(body.user.email).toBe("user@example.com");
    expect(body.user.verified).toBe(true);
  });

  it("does not expose sensitive fields", async () => {
    mockFindOne(mockUser);

    const response = await GET(makeGetRequest("user-123") as any);
    const body = await response.json();

    expect(body.user.password).toBeUndefined();
    expect(body.user.user_id).toBeUndefined();
  });

  it("returns 404 when user is not found", async () => {
    mockFindOne(null);

    const response = await GET(makeGetRequest("nonexistent") as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("user data not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeGetRequest() as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
