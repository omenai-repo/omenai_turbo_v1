import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema", () => ({
  PriceReview: { find: vi.fn(), countDocuments: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { exists: vi.fn() },
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

import { GET } from "../../../app/api/artworks/fetchPriceReviewRequests/route";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

const mockReviews = [
  { _id: "review-1", artist_id: "artist-123", status: "PENDING_ADMIN_REVIEW" },
];

function makeRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/artworks/fetchPriceReviewRequests");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url, { method: "GET" });
}

function mockArtistExists(exists: boolean) {
  vi.mocked(AccountArtist.exists).mockReturnValue({
    exec: vi.fn().mockResolvedValue(exists ? { _id: "artist-123" } : null),
  } as any);
}

function mockFindChain(docs: any[]) {
  const chain = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(docs),
  };
  vi.mocked(PriceReview.find).mockReturnValue(chain as any);
}

describe("GET /api/artworks/fetchPriceReviewRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockArtistExists(true);
    mockFindChain(mockReviews);
    vi.mocked(PriceReview.countDocuments).mockResolvedValue(1);
  });

  it("returns 200 with reviews and pagination meta for a valid artist", async () => {
    const response = await GET(makeRequest({ id: "artist-123", page: "1", limit: "20" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockReviews);
    expect(body.meta.currentPage).toBe(1);
    expect(body.meta.totalItems).toBe(1);
  });

  it("returns 401 when artist does not exist", async () => {
    mockArtistExists(false);

    const response = await GET(makeRequest({ id: "unknown-artist", page: "1" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Unauthorized artist");
  });

  it("filters reviews by a single status value", async () => {
    await GET(makeRequest({ id: "artist-123", status: "PENDING_ADMIN_REVIEW", page: "1" }));

    expect(PriceReview.find).toHaveBeenCalledWith(
      expect.objectContaining({ status: "PENDING_ADMIN_REVIEW" }),
    );
  });

  it("filters reviews by multiple comma-separated status values", async () => {
    await GET(makeRequest({ id: "artist-123", status: "PENDING_ADMIN_REVIEW,AUTO_APPROVED", page: "1" }));

    expect(PriceReview.find).toHaveBeenCalledWith(
      expect.objectContaining({ status: { $in: ["PENDING_ADMIN_REVIEW", "AUTO_APPROVED"] } }),
    );
  });

  it("uses default pagination values when page and limit are not provided", async () => {
    const response = await GET(makeRequest({ id: "artist-123" }));

    expect(response.status).toBe(200);
  });
});
