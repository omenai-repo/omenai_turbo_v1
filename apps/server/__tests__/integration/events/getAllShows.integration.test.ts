import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/events/getAllShows/route";

const { mockGetAllShowsService } = vi.hoisted(() => ({
  mockGetAllShowsService: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getAllShows.service", () => ({
  getAllShowsService: mockGetAllShowsService,
}));

function makeGetRequest(): Request {
  return new Request("http://localhost/api/events/getAllShows", {
    method: "GET",
  });
}

describe("GET /api/events/getAllShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with shows when service returns data", async () => {
    mockGetAllShowsService.mockResolvedValueOnce({
      data: [{ event_id: "evt-001", title: "Test Show" }],
    });

    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shows).toHaveLength(1);
    expect(body.shows[0].event_id).toBe("evt-001");
  });

  it("returns 200 with empty array when service returns no shows", async () => {
    mockGetAllShowsService.mockResolvedValueOnce({ data: [] });

    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shows).toEqual([]);
  });

  it("returns 500 when service throws an error", async () => {
    mockGetAllShowsService.mockRejectedValueOnce(new Error("DB failure"));

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
  });
});
