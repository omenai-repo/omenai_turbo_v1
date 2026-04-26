import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
  strictRateLimit: {},
}));

vi.mock("@omenai/shared-models/models/artist/ArtistCategorizationSchema", () => ({
  ArtistCategorization: { findOne: vi.fn() },
}));

vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/update/artist/profile/isEditEligible/route";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/update/artist/profile/isEditEligible", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/update/artist/profile/isEditEligible", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with isEligible=true when updatedAt is over 1 year ago", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue({
      updatedAt: "2020-01-01T00:00:00.000Z",
      request: null,
    } as any);

    const response = await POST(makeRequest({ artist_id: "artist-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Eligibility retrieved successfully");
    expect(body.eligibility.isEligible).toBe(true);
    expect(body.eligibility.daysLeft).toBe(0);
  });

  it("returns 200 with isEligible=false when updatedAt is less than 1 year ago", async () => {
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 6);

    vi.mocked(ArtistCategorization.findOne).mockResolvedValue({
      updatedAt: recentDate.toISOString(),
      request: null,
    } as any);

    const response = await POST(makeRequest({ artist_id: "artist-1" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.eligibility.isEligible).toBe(false);
    expect(body.eligibility.daysLeft).toBeGreaterThan(0);
  });

  it("returns 403 when a profile update request is already in progress", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue({
      updatedAt: "2020-01-01T00:00:00.000Z",
      request: { status: "pending" },
    } as any);

    const response = await POST(makeRequest({ artist_id: "artist-1" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already in progress/i);
  });

  it("returns 404 when categorization data is not found", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest({ artist_id: "ghost-artist" }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toMatch(/Categorization data not found/i);
  });

  it("returns 400 when artist_id is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
