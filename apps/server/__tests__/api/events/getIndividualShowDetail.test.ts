import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../app/api/services/events/getIndividualShowDetails.service", () => ({
  getIndividualShowService: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/events/getIndividualShowDetail/route";
import { getIndividualShowService } from "../../../app/api/services/events/getIndividualShowDetails.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockShowData = {
  event_id: "evt-1",
  title: "Lagos Art Week",
  artworks: [{ art_id: "art-1" }],
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/events/getIndividualShowDetail");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/events/getIndividualShowDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getIndividualShowService).mockResolvedValue({
      isOk: true,
      data: mockShowData,
    } as any);
  });

  it("returns 200 with show data on success", async () => {
    const response = await GET(makeRequest({ eventId: "evt-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isOk).toBe(true);
    expect(body.data).toEqual(mockShowData);
  });

  it("passes eventId to getIndividualShowService", async () => {
    await GET(makeRequest({ eventId: "evt-1" }));

    expect(getIndividualShowService).toHaveBeenCalledWith("evt-1");
  });

  it("returns 400 when eventId param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
  });

  it("returns 404 when service returns null (show not found)", async () => {
    vi.mocked(getIndividualShowService).mockResolvedValue(null as any);

    const response = await GET(makeRequest({ eventId: "evt-999" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Show not found");
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getIndividualShowService).mockRejectedValue(new Error("DB error"));

    const response = await GET(makeRequest({ eventId: "evt-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest({ eventId: "evt-1" }));

    expect(response.status).toBe(500);
  });
});
