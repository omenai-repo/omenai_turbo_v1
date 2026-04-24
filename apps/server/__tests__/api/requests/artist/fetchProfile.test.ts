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

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
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

import { GET } from "../../../../app/api/requests/artist/fetchProfile/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

const mockArtist = {
  artist_id: "artist-123",
  name: "Test Artist",
  logo: "https://example.com/logo.png",
  address: { city: "Paris" },
  email: "artist@example.com",
  bio: "A great artist",
};

function makeGetRequest(id?: string): unknown {
  const url = `http://localhost/api/requests/artist/fetchProfile${id ? `?id=${id}` : ""}`;
  return { nextUrl: new URL(url) };
}

function mockFindOne(value: typeof mockArtist | null) {
  vi.mocked(AccountArtist.findOne).mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  } as any);
}

describe("GET /api/requests/artist/fetchProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with artist profile data", async () => {
    mockFindOne(mockArtist);

    const response = await GET(makeGetRequest("artist-123") as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Profile retrieved successfully");
    expect(body.artist.name).toBe("Test Artist");
    expect(body.artist.email).toBe("artist@example.com");
    expect(body.artist.bio).toBe("A great artist");
  });

  it("does not expose sensitive fields", async () => {
    mockFindOne(mockArtist);

    const response = await GET(makeGetRequest("artist-123") as any);
    const body = await response.json();

    expect(body.artist.password).toBeUndefined();
    expect(body.artist.artist_id).toBeUndefined();
  });

  it("returns 404 when artist is not found", async () => {
    mockFindOne(null);

    const response = await GET(makeGetRequest("nonexistent") as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Artist not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeGetRequest() as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
