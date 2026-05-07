import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../app/api/services/events/getEvents.service", () => ({
  getIndividualFairOrEventService: vi.fn(),
  getAllFairsAndEventsService: vi.fn(),
}));

import { GET } from "../../../app/api/events/getSingleEvent/route";
import { getIndividualFairOrEventService } from "../../../app/api/services/events/getEvents.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockEvent = {
  event_id: "evt-1",
  title: "Art Basel Miami",
  event_type: "Fair",
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getSingleEvent");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getSingleEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getIndividualFairOrEventService).mockResolvedValue({
      isOk: true,
      data: mockEvent,
    } as any);
  });

  it("returns 200 with event data on success", async () => {
    const response = await GET(makeRequest({ event_id: "evt-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockEvent);
  });

  it("passes event_id to getIndividualFairOrEventService", async () => {
    await GET(makeRequest({ event_id: "evt-1" }));

    expect(getIndividualFairOrEventService).toHaveBeenCalledWith("evt-1");
  });

  it("returns 400 when event_id param is missing", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Event ID is required");
  });

  it("returns 404 when service returns isOk:false", async () => {
    vi.mocked(getIndividualFairOrEventService).mockResolvedValue({
      isOk: false,
      data: null,
      message: "Not found",
    } as any);

    const response = await GET(makeRequest({ event_id: "evt-999" }));

    expect(response.status).toBe(404);
  });

  it("returns 404 when service returns no data", async () => {
    vi.mocked(getIndividualFairOrEventService).mockResolvedValue({
      isOk: true,
      data: null,
    } as any);

    const response = await GET(makeRequest({ event_id: "evt-1" }));

    expect(response.status).toBe(404);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getIndividualFairOrEventService).mockRejectedValue(new Error("Unexpected"));

    const response = await GET(makeRequest({ event_id: "evt-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest({ event_id: "evt-1" }));

    expect(response.status).toBe(500);
  });
});
