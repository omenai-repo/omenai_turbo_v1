import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/events/getFeaturedShows/route";

const { mockGetFeaturedShowsCarousel } = vi.hoisted(() => ({
  mockGetFeaturedShowsCarousel: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getFeaturedShows.service", () => ({
  getFeaturedShowsCarousel: mockGetFeaturedShowsCarousel,
}));

function makeGetRequest(): Request {
  return new Request("http://localhost/api/events/getFeaturedShows", {
    method: "GET",
  });
}

describe("GET /api/events/getFeaturedShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with shows when service returns data", async () => {
    mockGetFeaturedShowsCarousel.mockResolvedValueOnce({
      data: [{ event_id: "evt-001" }],
    });

    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shows[0].event_id).toBe("evt-001");
  });

  it("returns 200 with empty array when service returns no shows", async () => {
    mockGetFeaturedShowsCarousel.mockResolvedValueOnce({ data: [] });

    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shows).toEqual([]);
  });

  it("returns 500 when service throws an error", async () => {
    mockGetFeaturedShowsCarousel.mockRejectedValueOnce(new Error("Service failure"));

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
  });
});
