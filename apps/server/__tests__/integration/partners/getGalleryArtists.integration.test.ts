import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/partners/getGalleryArtists/route";

const { mockGetGalleryArtistsService } = vi.hoisted(() => ({
  mockGetGalleryArtistsService: vi.fn(),
}));

vi.mock(
  "../../../app/api/services/gallery/partners/getGalleryArtists.service",
  () => ({
    getGalleryArtistsService: mockGetGalleryArtistsService,
  }),
);

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryArtists");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryArtists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 500 when gallery id is missing (BadRequestError caught generically)", async () => {
    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Internal Server Error");
  });

  it("returns 500 when service returns isOk: false", async () => {
    mockGetGalleryArtistsService.mockResolvedValueOnce({
      isOk: false,
      message: "Error",
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Error");
  });

  it("returns 200 with data and pagination when service succeeds", async () => {
    mockGetGalleryArtistsService.mockResolvedValueOnce({
      isOk: true,
      data: [{ name: "Artist" }],
      pagination: { page: 1 },
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Artist");
    expect(body.pagination.page).toBe(1);
  });
});
