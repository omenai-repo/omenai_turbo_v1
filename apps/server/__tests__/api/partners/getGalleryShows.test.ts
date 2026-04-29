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

vi.mock("../../../app/api/services/gallery/partners/getGalleryShows.service", () => ({
  getGalleryShowsService: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/partners/getGalleryShows/route";
import { getGalleryShowsService } from "../../../app/api/services/gallery/partners/getGalleryShows.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockShows = [{ event_id: "evt-1", title: "Lagos Art Week" }];
const mockPagination = { page: 1, limit: 12, total: 1, totalPages: 1 };

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryShows");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGalleryShowsService).mockResolvedValue({
      isOk: true,
      data: mockShows,
      pagination: mockPagination,
    } as any);
  });

  it("returns 200 with shows and pagination on success", async () => {
    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockShows);
    expect(body.pagination).toEqual(mockPagination);
  });

  it("passes gallery_id, page, and limit to service", async () => {
    await GET(makeRequest({ id: "gallery-1", page: "2", limit: "6" }));

    expect(getGalleryShowsService).toHaveBeenCalledWith("gallery-1", 2, 6);
  });

  it("defaults page to 1 and limit to 12 when not provided", async () => {
    await GET(makeRequest({ id: "gallery-1" }));

    expect(getGalleryShowsService).toHaveBeenCalledWith("gallery-1", 1, 12);
  });

  it("returns 400 when service returns isOk:false", async () => {
    vi.mocked(getGalleryShowsService).mockResolvedValue({
      isOk: false,
      message: "Internal Server Error",
    } as any);

    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getGalleryShowsService).mockRejectedValue(new Error("Unexpected"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });
});
