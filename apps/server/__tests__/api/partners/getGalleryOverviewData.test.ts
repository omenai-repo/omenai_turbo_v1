import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../app/api/services/gallery/partners/getGalleryOverview.service", () => ({
  getGalleryOverviewService: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/partners/getGalleryOverviewData/route";
import { getGalleryOverviewService } from "../../../app/api/services/gallery/partners/getGalleryOverview.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockOverview = {
  description: "A leading contemporary art gallery.",
  represented_artists: [{ artist_id: "a-1", name: "Amara" }],
  available_artists: [],
  events: [],
};

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/partners/getGalleryOverviewData");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/partners/getGalleryOverviewData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGalleryOverviewService).mockResolvedValue({
      isOk: true,
      data: mockOverview,
    } as any);
  });

  it("returns 200 with overview data on success", async () => {
    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockOverview);
  });

  it("passes gallery_id to getGalleryOverviewService", async () => {
    await GET(makeRequest({ id: "gallery-1" }));

    expect(getGalleryOverviewService).toHaveBeenCalledWith("gallery-1");
  });

  it("returns 400 when service returns isOk:false", async () => {
    vi.mocked(getGalleryOverviewService).mockResolvedValue({
      isOk: false,
      message: "Gallery not found",
    } as any);

    const response = await GET(makeRequest({ id: "gallery-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Gallery not found");
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getGalleryOverviewService).mockRejectedValue(new Error("Unexpected"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET(makeRequest({ id: "gallery-1" }));

    expect(response.status).toBe(500);
  });
});
