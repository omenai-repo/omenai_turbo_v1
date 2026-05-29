import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/events/getSingleEvent/route";

const { mockGetIndividualFairOrEventService } = vi.hoisted(() => ({
  mockGetIndividualFairOrEventService: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getEvents.service", () => ({
  getAllFairsAndEventsService: vi.fn(),
  getIndividualFairOrEventService: mockGetIndividualFairOrEventService,
}));

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getSingleEvent");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getSingleEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when event_id is missing", async () => {
    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Event ID is required");
  });

  it("returns 404 when service returns isOk: false", async () => {
    mockGetIndividualFairOrEventService.mockResolvedValueOnce({
      isOk: false,
      message: "Event not found",
    });

    const response = await GET(makeGetRequest({ event_id: "evt-999" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Event not found");
  });

  it("returns 200 with event data when service succeeds", async () => {
    mockGetIndividualFairOrEventService.mockResolvedValueOnce({
      isOk: true,
      data: { event_id: "evt-001", title: "Art Fair" },
    });

    const response = await GET(makeGetRequest({ event_id: "evt-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe("Art Fair");
    expect(body.data.event_id).toBe("evt-001");
  });
});
