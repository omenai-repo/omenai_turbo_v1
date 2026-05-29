import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/partners/getGalleryOverviewData/route";

const { mockGetGalleryOverviewService } = vi.hoisted(() => ({
  mockGetGalleryOverviewService: vi.fn(),
}));

vi.mock(
  "../../../app/api/services/gallery/partners/getGalleryOverview.service",
  () => ({
    getGalleryOverviewService: mockGetGalleryOverviewService,
  }),
);

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryOverviewData");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryOverviewData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when gallery id is missing", async () => {
    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Missing gallery_id/i);
  });

  it("returns 400 when service returns isOk: false", async () => {
    mockGetGalleryOverviewService.mockResolvedValueOnce({
      isOk: false,
      message: "Not found",
    });

    const response = await GET(makeGetRequest({ id: "gallery-999" }));

    expect(response.status).toBe(400);
  });

  it("returns 200 with overview data when service succeeds", async () => {
    mockGetGalleryOverviewService.mockResolvedValueOnce({
      isOk: true,
      data: { name: "Gallery", artworkCount: 5 },
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.name).toBe("Gallery");
    expect(body.data.artworkCount).toBe(5);
  });
});
