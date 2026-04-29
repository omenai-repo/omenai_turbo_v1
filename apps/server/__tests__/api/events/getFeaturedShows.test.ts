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

vi.mock("../../../app/api/services/events/getFeaturedShows.service", () => ({
  getFeaturedShowsCarousel: vi.fn(),
}));

vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../app/api/events/getFeaturedShows/route";
import { getFeaturedShowsCarousel } from "../../../app/api/services/events/getFeaturedShows.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const mockFeaturedShows = [
  { event_id: "show-1", title: "Art Basel" },
  { event_id: "show-2", title: "Frieze London" },
];

describe("GET /api/events/getFeaturedShows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFeaturedShowsCarousel).mockResolvedValue({
      isOk: true,
      data: mockFeaturedShows,
    } as any);
  });

  it("returns 200 with featured shows data", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shows).toEqual(mockFeaturedShows);
  });

  it("returns 500 when service throws", async () => {
    vi.mocked(getFeaturedShowsCarousel).mockRejectedValue(new Error("DB error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
