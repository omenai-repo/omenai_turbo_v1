import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/auth/profile/artist/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

const mockArtist = {
  artist_id: "artist-abc-123",
  name: "Test Artist",
  email: "artist@example.com",
  address: { city: "New York", country: "United States" },
  base_currency: "USD",
};

function makeRequest(id?: string): Request {
  const url = id
    ? `http://localhost/api/auth/profile/artist?id=${id}`
    : "http://localhost/api/auth/profile/artist";
  return new Request(url, { method: "GET" });
}

function mockFindOne(value: typeof mockArtist | null) {
  vi.mocked(AccountArtist.findOne).mockResolvedValue(value as any);
}

describe("GET /api/auth/profile/artist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with artist data when a valid id is provided", async () => {
    mockFindOne(mockArtist);

    const response = await GET(makeRequest("artist-abc-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.artist).toEqual(mockArtist);
    expect(AccountArtist.findOne).toHaveBeenCalledWith(
      { artist_id: "artist-abc-123" },
      "name, email, address base_currency",
    );
  });

  it("returns 404 when no artist matches the given id", async () => {
    mockFindOne(null);

    const response = await GET(makeRequest("nonexistent-id"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Artist not found");
  });

  it("returns 500 when the id query param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(AccountArtist.findOne).not.toHaveBeenCalled();
  });

  it("does not call the database when id is an empty string", async () => {
    const response = await GET(makeRequest(""));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(AccountArtist.findOne).not.toHaveBeenCalled();
  });
});
