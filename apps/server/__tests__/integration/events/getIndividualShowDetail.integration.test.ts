import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "../../../app/api/events/getIndividualShowDetail/route";

const { mockGetIndividualShowService } = vi.hoisted(() => ({
  mockGetIndividualShowService: vi.fn(),
}));

vi.mock(
  "../../../app/api/services/events/getIndividualShowDetails.service",
  () => ({
    getIndividualShowService: mockGetIndividualShowService,
  }),
);

function makeGetRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getIndividualShowDetail");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getIndividualShowDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when eventId is missing", async () => {
    const response = await GET(makeGetRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Invalid or missing eventId/i);
  });

  it("returns 404 when service returns a falsy value", async () => {
    mockGetIndividualShowService.mockResolvedValueOnce(null);

    const response = await GET(makeGetRequest({ eventId: "show-999" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Show not found");
  });

  it("returns 200 with show data when service succeeds", async () => {
    mockGetIndividualShowService.mockResolvedValueOnce({
      data: { event_id: "show-001", title: "The Show" },
    });

    const response = await GET(makeGetRequest({ eventId: "show-001" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isOk).toBe(true);
    expect(body.data.title).toBe("The Show");
  });
});
