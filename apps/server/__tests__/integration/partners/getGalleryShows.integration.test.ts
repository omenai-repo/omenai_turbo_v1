import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/partners/getGalleryShows/route";

const { mockGetGalleryShowsService } = vi.hoisted(() => ({
  mockGetGalleryShowsService: vi.fn(),
}));

vi.mock(
  "../../../app/api/services/gallery/partners/getGalleryShows.service",
  () => ({
    getGalleryShowsService: mockGetGalleryShowsService,
  }),
);

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryShows");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryShows", () => {
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
    mockGetGalleryShowsService.mockResolvedValueOnce({
      isOk: false,
      message: "Error",
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));

    expect(response.status).toBe(400);
  });

  it("returns 200 with data and pagination when service succeeds", async () => {
    mockGetGalleryShowsService.mockResolvedValueOnce({
      isOk: true,
      data: [{ event_id: "show-001" }],
      pagination: { total: 1 },
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].event_id).toBe("show-001");
    expect(body.pagination.total).toBe(1);
  });
});
