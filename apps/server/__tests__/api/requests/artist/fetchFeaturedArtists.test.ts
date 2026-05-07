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
  AccountArtist: { find: vi.fn() },
}));
vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/requests/artist/fetchFeaturedArtists/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

function makeRequest() {
  return new Request("http://localhost/api/requests/artist/fetchFeaturedArtists");
}

const mockArtists = [
  { artist_id: "a-1", name: "Alice", logo: "logo1.jpg" },
  { artist_id: "a-2", name: "Bob", logo: "logo2.jpg" },
];

describe("GET /api/requests/artist/fetchFeaturedArtists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with a list of featured artists", async () => {
    vi.mocked(AccountArtist.find).mockReturnValue({
      limit: vi.fn().mockResolvedValue(mockArtists),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Featured artists fetched");
    expect(body.data).toHaveLength(2);
    expect(body.data[0].name).toBe("Alice");
  });

  it("returns empty data array when no artists exist", async () => {
    vi.mocked(AccountArtist.find).mockReturnValue({
      limit: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.data).toEqual([]);
  });

  it("returns 500 when a database error occurs", async () => {
    vi.mocked(AccountArtist.find).mockReturnValue({
      limit: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
