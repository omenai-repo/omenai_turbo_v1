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

vi.mock("../../../app/api/services/events/getAllShows.service", () => ({
  getAllShowsService: vi.fn(),
}));

vi.mock("../../../app/api/services/events/getFeaturedShows.service", () => ({
  getFeaturedShowsCarousel: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/events/getAllShows/route";
import { getAllShowsService } from "../../../app/api/services/events/getAllShows.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockShows = [{ event_id: "show-1", title: "Lagos Art Week" }];

describe("GET /api/events/getAllShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllShowsService).mockResolvedValue({
      isOk: true,
      data: mockShows,
    } as any);
  });

  it("returns 200 with shows data", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shows).toEqual(mockShows);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getAllShowsService).mockRejectedValue(new Error("DB error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
