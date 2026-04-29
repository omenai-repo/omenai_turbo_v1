import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/artist/ArtistCategorizationSchema",
  () => ({
    ArtistCategorization: {
      findOne: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/admin/fetch_artist_verif_info/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";

function makeRequest(artistId?: string): Request {
  const url = artistId
    ? `http://localhost/api/admin/fetch_artist_verif_info?id=${artistId}`
    : "http://localhost/api/admin/fetch_artist_verif_info";
  return new Request(url, { method: "GET" });
}

const mockArtist = {
  name: "Test Artist",
  email: "artist@example.com",
  artist_id: "artist-123",
};

const mockVerifReq = {
  request: { categorization: { artist_categorization: "emerging" } },
};

describe("GET /api/admin/fetch_artist_verif_info", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist);
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(mockVerifReq);
  });

  it("returns 200 with artist and verification data", async () => {
    const response = await GET(makeRequest("artist-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Data retrieved");
    expect(body.data.artist).toEqual(mockArtist);
    expect(body.data.request).toEqual(mockVerifReq.request);
  });

  it("returns 500 when artist is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("ghost-artist"));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 500 when categorization is not found", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(null);

    const response = await GET(makeRequest("artist-123"));
    const body = await response.json();

    expect(response.status).toBe(500);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
