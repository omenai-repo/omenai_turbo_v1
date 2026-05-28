import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/events/getAllEvents/route";

const { mockGetAllFairsAndEventsService } = vi.hoisted(() => ({
  mockGetAllFairsAndEventsService: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getEvents.service", () => ({
  getAllFairsAndEventsService: mockGetAllFairsAndEventsService,
  getIndividualFairOrEventService: vi.fn(),
}));

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getAllEvents");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getAllEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with data and pagination when service succeeds", async () => {
    mockGetAllFairsAndEventsService.mockResolvedValueOnce({
      isOk: true,
      data: [{ event_id: "evt-001" }],
      pagination: { page: 1, total: 1 },
    });

    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.pagination.page).toBe(1);
  });

  it("returns 500 when service returns isOk: false", async () => {
    mockGetAllFairsAndEventsService.mockResolvedValueOnce({
      isOk: false,
      message: "DB error",
    });

    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("DB error");
  });

  it("passes pagination and filter params to the service", async () => {
    mockGetAllFairsAndEventsService.mockResolvedValueOnce({
      isOk: true,
      data: [],
      pagination: { page: 2, total: 0 },
    });

    await GET(makeGetRequest({ page: "2", limit: "6", filter: "Art Fair" }));

    expect(mockGetAllFairsAndEventsService).toHaveBeenCalledWith(2, 6, "Art Fair");
  });
});
