import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { aggregate: vi.fn() },
}));
vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/requests/artist/fetchTrendingArtists/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

function makeRequest() {
  return new Request("http://localhost/api/requests/artist/fetchTrendingArtists");
}

const mockTrendingData = [
  {
    author_id: "a-1",
    artist: "Alice",
    totalLikes: 120,
    likePercentage: 15.5,
    mostLikedArtwork: { title: "Sunset", likeCount: 80 },
  },
];

describe("GET /api/requests/artist/fetchTrendingArtists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with trending artists", async () => {
    vi.mocked(Artworkuploads.aggregate).mockResolvedValue(mockTrendingData as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Trending artist retrieved");
    expect(body.data).toHaveLength(1);
    expect(body.data[0].artist).toBe("Alice");
  });

  it("returns empty data array when no trending artists", async () => {
    vi.mocked(Artworkuploads.aggregate).mockResolvedValue([] as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 500 when aggregation fails", async () => {
    vi.mocked(Artworkuploads.aggregate).mockRejectedValue(new Error("Aggregation error"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
