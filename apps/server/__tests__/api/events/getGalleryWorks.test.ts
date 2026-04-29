import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../app/api/services/events/getEvents.service", () => ({
  getAllFairsAndEventsService: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getGalleryWorks.service", () => ({
  getGalleryWorksService: vi.fn(),
}));

import { GET } from "../../../app/api/events/getGalleryWorks/route";
import { getGalleryWorksService } from "../../../app/api/services/events/getGalleryWorks.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockArtworks = [{ art_id: "art-1", title: "Sunset" }];
const mockPagination = { page: 1, limit: 20, total: 1, totalPages: 1 };

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getGalleryWorks");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getGalleryWorks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGalleryWorksService).mockResolvedValue({
      isOk: true,
      data: mockArtworks,
      pagination: mockPagination,
    } as any);
  });

  it("returns 200 with artworks and pagination", async () => {
    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockArtworks);
    expect(body.pagination).toEqual(mockPagination);
  });

  it("passes gallery_id, page, limit, and filters to service", async () => {
    await GET(
      makeRequest({ id: "gallery-1", page: "2", limit: "10", artist: "Amara", medium: "Oil", price: "Under 1000" }),
    );

    expect(getGalleryWorksService).toHaveBeenCalledWith(
      "gallery-1",
      2,
      10,
      expect.objectContaining({ artist: "Amara", medium: "Oil", price: "Under 1000" }),
    );
  });

  it("defaults page=1 and limit=20 when params not provided", async () => {
    await GET(makeRequest({ id: "gallery-1" }));

    expect(getGalleryWorksService).toHaveBeenCalledWith(
      "gallery-1",
      1,
      20,
      expect.anything(),
    );
  });

  it("returns 500 when gallery_id is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 500 when service returns isOk:false", async () => {
    vi.mocked(getGalleryWorksService).mockResolvedValue({
      isOk: false,
      message: "Error",
    } as any);

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getGalleryWorksService).mockRejectedValue(new Error("Unexpected"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });
});
