import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../app/api/services/events/getEvents.service", () => ({
  getAllFairsAndEventsService: vi.fn(),
  getIndividualFairOrEventService: vi.fn(),
}));

import { GET } from "../../../app/api/events/getAllEvents/route";
import { getAllFairsAndEventsService } from "../../../app/api/services/events/getEvents.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockEvents = [{ event_id: "evt-1", title: "Art Basel" }];
const mockPagination = { page: 1, limit: 12, total: 1, totalPages: 1 };

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getAllEvents");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getAllEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllFairsAndEventsService).mockResolvedValue({
      isOk: true,
      data: mockEvents,
      pagination: mockPagination,
    } as any);
  });

  it("returns 200 with events and pagination", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockEvents);
    expect(body.pagination).toEqual(mockPagination);
  });

  it("passes page, limit, and filter to service", async () => {
    await GET(makeRequest({ page: "2", limit: "6", filter: "Fairs" }));

    expect(getAllFairsAndEventsService).toHaveBeenCalledWith(2, 6, "Fairs");
  });

  it("defaults page=1, limit=12, filter=All when params not provided", async () => {
    await GET(makeRequest());

    expect(getAllFairsAndEventsService).toHaveBeenCalledWith(1, 12, "All");
  });

  it("returns 500 when service returns isOk:false", async () => {
    vi.mocked(getAllFairsAndEventsService).mockResolvedValue({
      isOk: false,
      message: "DB error",
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBeDefined();
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getAllFairsAndEventsService).mockRejectedValue(new Error("Unexpected"));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest());

    expect(response.status).toBe(500);
  });
});
