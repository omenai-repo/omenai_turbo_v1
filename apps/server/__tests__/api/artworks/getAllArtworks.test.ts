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
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/artworks/getAllArtworks/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../app/api/artworks/utils";

const mockArtworks = [{ art_id: "art-1" }, { art_id: "art-2" }];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getAllArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindChain(docs: any[]) {
  const chain = {
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(docs),
  };
  vi.mocked(Artworkuploads.find).mockReturnValue(chain as any);
}

describe("POST /api/artworks/getAllArtworks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindChain([{ art_id: "art-1" }, { art_id: "art-2" }]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockArtworks);
  });

  it("returns 200 with artworks for a valid page", async () => {
    const response = await POST(makeRequest({ page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtworks);
  });

  it("calls fetchArtworksFromCache with the extracted art IDs", async () => {
    await POST(makeRequest({ page: 1 }));

    expect(fetchArtworksFromCache).toHaveBeenCalledWith(["art-1", "art-2"]);
  });

  it("returns 400 when page is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 500 when fetchArtworksFromCache returns null", async () => {
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(null as any);

    const response = await POST(makeRequest({ page: 1 }));
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});
