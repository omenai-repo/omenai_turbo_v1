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

vi.mock("../../../app/api/services/gallery/partners/getGalleryArtists.service", () => ({
  getGalleryArtistsService: vi.fn(),
}));

import { GET } from "../../../app/api/partners/getGalleryArtists/route";
import { getGalleryArtistsService } from "../../../app/api/services/gallery/partners/getGalleryArtists.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockData = [{ artist_id: "artist-1", name: "Amara" }];
const mockPagination = { page: 1, limit: 5, total: 1, totalPages: 1 };

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryArtists");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryArtists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGalleryArtistsService).mockResolvedValue({
      isOk: true,
      data: mockData,
      pagination: mockPagination,
    } as any);
  });

  it("returns 200 with data and pagination on success", async () => {
    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockData);
    expect(body.pagination).toEqual(mockPagination);
  });

  it("passes galleryId, page, limit, and artist params to service", async () => {
    await GET(makeRequest({ id: "gallery-1", page: "2", limit: "10", artist: "artist-1" }));

    expect(getGalleryArtistsService).toHaveBeenCalledWith("gallery-1", 2, 10, "artist-1");
  });

  it("defaults page to 1 and limit to 5 when not provided", async () => {
    await GET(makeRequest({ id: "gallery-1" }));

    expect(getGalleryArtistsService).toHaveBeenCalledWith("gallery-1", 1, 5, undefined);
  });

  it("returns 500 when service returns isOk:false", async () => {
    vi.mocked(getGalleryArtistsService).mockResolvedValue({
      isOk: false,
      message: "Internal Server Error",
    } as any);

    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });

  it("returns 500 when id param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getGalleryArtistsService).mockRejectedValue(new Error("Unexpected"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });
});
