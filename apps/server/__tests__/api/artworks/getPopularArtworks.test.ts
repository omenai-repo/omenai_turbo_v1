import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { find: vi.fn() },
}));
vi.mock("../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../app/api/artworks/getPopularArtworks/route";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/getPopularArtworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindChain(docs: any[]) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(docs),
  };
  vi.mocked(Artworkuploads.find).mockReturnValue(chain as any);
}

describe("POST /api/artworks/getPopularArtworks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with artworks sorted by impressions", async () => {
    mockFindChain([
      { art_id: "art-1", impressions: 10 },
      { art_id: "art-2", impressions: 5 },
    ]);

    const response = await POST(makeRequest({ id: "author-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toHaveLength(2);
  });

  it("filters out artworks with zero impressions", async () => {
    mockFindChain([
      { art_id: "art-1", impressions: 5 },
      { art_id: "art-2", impressions: 0 },
    ]);

    const response = await POST(makeRequest({ id: "author-123" }));
    const body = await response.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].art_id).toBe("art-1");
  });

  it("returns 400 when id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
