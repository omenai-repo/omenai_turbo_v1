import { describe, it, expect, afterEach } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { GET } from "../../../app/api/artworks/fetchPriceReviewRequests/route";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtist(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    name: "Test Artist",
    profile_status: "ghost",
    artist_id: `artist-${uid}`,
    verified: false,
    artist_verified: false,
    documentation: {
      cv: "",
      socials: { instagram: "", twitter: "", facebook: "", linkedin: "" },
    },
    pricing_allowances: {
      auto_approvals_used: 0,
      last_reset_date: new Date(),
    },
    ...overrides,
  };
}

function makePriceReview(artist_id: string, overrides: Record<string, any> = {}) {
  return {
    artist_id,
    artist_review: {
      requested_price: 1500,
      justification_type: "OTHER",
      justification_notes: "Test review",
      justification_proof_url: "",
    },
    meta: {
      artwork: { title: "Test Artwork" },
      algorithm_recommendation: {
        recommendedPrice: 1200,
        priceRange: [800, 1000, 1200, 1400, 1600, 1800],
        meanPrice: 1200,
      },
    },
    status: "PENDING_ADMIN_REVIEW",
    ...overrides,
  };
}

function makeRequest(artistId: string, params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/artworks/fetchPriceReviewRequests");
  url.searchParams.set("id", artistId);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: "GET" });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/artworks/fetchPriceReviewRequests (integration)", () => {
  afterEach(async () => {
    await AccountArtist.deleteMany({});
    await PriceReview.deleteMany({});
  });

  it("returns 401 when artist does not exist", async () => {
    const response = await GET(makeRequest("non-existent-artist"));

    expect(response.status).toBe(401);
  });

  it("returns reviews for a valid artist", async () => {
    const artist = await AccountArtist.create(makeArtist());
    await PriceReview.create([
      makePriceReview(artist.artist_id),
      makePriceReview(artist.artist_id, { status: "AUTO_APPROVED" }),
    ]);

    const response = await GET(makeRequest(artist.artist_id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta.totalItems).toBe(2);
    expect(body.meta.currentPage).toBe(1);
  });

  it("does not return reviews belonging to another artist", async () => {
    const artistA = await AccountArtist.create(makeArtist());
    const artistB = await AccountArtist.create(makeArtist());
    await PriceReview.create(makePriceReview(artistB.artist_id));

    const response = await GET(makeRequest(artistA.artist_id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });

  it("filters reviews by status when status query param is provided", async () => {
    const artist = await AccountArtist.create(makeArtist());
    await PriceReview.create([
      makePriceReview(artist.artist_id, { status: "PENDING_ADMIN_REVIEW" }),
      makePriceReview(artist.artist_id, { status: "AUTO_APPROVED" }),
    ]);

    const response = await GET(makeRequest(artist.artist_id, { status: "AUTO_APPROVED" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].status).toBe("AUTO_APPROVED");
  });

  it("returns an empty list when the artist has no reviews", async () => {
    const artist = await AccountArtist.create(makeArtist());

    const response = await GET(makeRequest(artist.artist_id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.meta.totalItems).toBe(0);
  });

  it("supports pagination via page and limit query params", async () => {
    const artist = await AccountArtist.create(makeArtist());
    const reviews = Array.from({ length: 5 }, () => makePriceReview(artist.artist_id));
    await PriceReview.create(reviews);

    const response = await GET(makeRequest(artist.artist_id, { page: "2", limit: "3" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.meta.currentPage).toBe(2);
  });
});
