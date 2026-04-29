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
  Artworkuploads: { find: vi.fn() },
}));
vi.mock("../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
  getCachedGalleryIds: vi.fn().mockResolvedValue(["gallery-1"]),
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/artworks/getArtworksByArtist/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../app/api/artworks/utils";

const mockArtworks = [{ art_id: "art-1" }];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getArtworksByArtist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindChain(docs: any[]) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(docs),
  };
  vi.mocked(Artworkuploads.find).mockReturnValue(chain as any);
}

describe("POST /api/artworks/getArtworksByArtist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindChain([{ art_id: "art-1" }]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockArtworks);
  });

  it("returns 200 with artworks for the given artist", async () => {
    const response = await POST(makeRequest({ artist: "artist-name", page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtworks);
  });

  it("returns 400 when artist is missing", async () => {
    const response = await POST(makeRequest({ page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("uses page 1 by default when page is not provided", async () => {
    const response = await POST(makeRequest({ artist: "artist-name" }));
    const body = await response.json();

    // page defaults to 1 via schema, so the request succeeds
    expect(response.status).toBe(200);
  });
});
