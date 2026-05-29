import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/partners/getGalleryProfile/route";

const { mockGetGalleryProfile } = vi.hoisted(() => ({
  mockGetGalleryProfile: vi.fn(),
}));

vi.mock(
  "../../../app/api/services/gallery/partners/getGalleryProfile.service",
  () => ({
    getGalleryProfile: mockGetGalleryProfile,
  }),
);

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryProfile");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryProfile", () => {
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
    mockGetGalleryProfile.mockResolvedValueOnce({
      isOk: false,
      message: "Not found",
    });

    const response = await GET(makeGetRequest({ id: "gallery-999" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it("returns 200 with gallery data when service succeeds", async () => {
    mockGetGalleryProfile.mockResolvedValueOnce({
      isOk: true,
      data: { name: "Test Gallery", gallery_id: "gallery-001" },
    });

    const response = await GET(makeGetRequest({ id: "gallery-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.name).toBe("Test Gallery");
    expect(body.data.gallery_id).toBe("gallery-001");
  });
});
