import { describe, it, expect, vi } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));
vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/requests/artist/fetchEmergingArtist/route";

describe("GET /api/requests/artist/fetchEmergingArtist", () => {
  it("returns 200 with an empty response object", async () => {
    const request = new Request("http://localhost/api/requests/artist/fetchEmergingArtist");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({});
  });
});
