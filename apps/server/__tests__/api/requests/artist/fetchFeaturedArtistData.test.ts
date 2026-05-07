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
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { find: vi.fn() },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../../app/api/requests/artist/fetchFeaturedArtistData/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockArtist = {
  artist_id: "artist-1",
  name: "Alice",
  logo: "logo.jpg",
  bio: "An artist",
  documentation: {},
  address: { city: "Paris" },
};
const mockArtworks = [
  { art_id: "art-1", title: "Sunrise" },
  { art_id: "art-2", title: "Dusk" },
];

function makeRequest(id?: string) {
  const url = `http://localhost/api/requests/artist/fetchFeaturedArtistData${id ? `?id=${id}` : ""}`;
  return new Request(url);
}

describe("GET /api/requests/artist/fetchFeaturedArtistData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with artist data and artworks", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(Artworkuploads.find).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockArtworks),
    } as any);

    const response = await GET(makeRequest("artist-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Featured artist data fetched");
    expect(body.data.name).toBe("Alice");
    expect(body.artist_artworks).toHaveLength(2);
  });

  it("returns 404 when artist is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Artist not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid URL parameters");
  });
});
