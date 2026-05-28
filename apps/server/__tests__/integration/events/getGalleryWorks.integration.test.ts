import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/events/getGalleryWorks/route";

const { mockGetGalleryWorksService } = vi.hoisted(() => ({
  mockGetGalleryWorksService: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getGalleryWorks.service", () => ({
  getGalleryWorksService: mockGetGalleryWorksService,
}));

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getGalleryWorks");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getGalleryWorks", () => {
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
    mockGetGalleryWorksService.mockResolvedValueOnce({
      isOk: false,
      message: "Error",
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Error");
  });

  it("returns 200 with data and pagination when service succeeds", async () => {
    mockGetGalleryWorksService.mockResolvedValueOnce({
      isOk: true,
      data: [{ art_id: "art-001" }],
      pagination: { page: 1, total: 1 },
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].art_id).toBe("art-001");
    expect(body.pagination.page).toBe(1);
  });
});
