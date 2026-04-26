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

import { POST } from "../../../app/api/artworks/getAllArtworksbyId/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../app/api/artworks/utils";

const mockArtworks = [{ art_id: "art-1" }, { art_id: "art-2" }];

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getAllArtworksbyId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindChain(docs: any[]) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(docs),
  };
  vi.mocked(Artworkuploads.find).mockReturnValue(chain as any);
}

describe("POST /api/artworks/getAllArtworksbyId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindChain([{ art_id: "art-1" }, { art_id: "art-2" }]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockArtworks);
  });

  it("returns 200 with artworks and count for a valid author id", async () => {
    const response = await POST(makeRequest({ id: "gallery-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockArtworks);
    expect(body.count).toBe(2);
  });

  it("queries artworks by the provided author_id", async () => {
    await POST(makeRequest({ id: "gallery-123" }));

    expect(Artworkuploads.find).toHaveBeenCalledWith({ author_id: "gallery-123" });
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when id is an empty string", async () => {
    const response = await POST(makeRequest({ id: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
