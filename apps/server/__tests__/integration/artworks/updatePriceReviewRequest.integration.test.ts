import { describe, it, expect, afterEach, vi } from "vitest";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { PATCH } from "../../../app/api/artworks/updatePriceReviewRequest/route";

// uploadArtworkLogic is called when an offer is accepted; mock it to avoid
// triggering the actual Appwrite/DB upload pipeline in tests.
vi.mock("../../../app/api/services/uploadArtwork.service", () => ({
  uploadArtworkLogic: vi.fn().mockResolvedValue(undefined),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ARTIST_ID = "artist-review-test";

function makePriceReview(overrides: Record<string, any> = {}) {
  return {
    artist_id: ARTIST_ID,
    artist_review: {
      requested_price: 1500,
      justification_type: "OTHER",
      justification_notes: "Need more",
      justification_proof_url: "",
    },
    meta: {
      artwork: { title: "Test Artwork", url: "https://example.com/art.jpg" },
      algorithm_recommendation: {
        recommendedPrice: 1200,
        priceRange: [800, 1000, 1200, 1400, 1600, 1800],
        meanPrice: 1200,
      },
    },
    status: "PENDING_ARTIST_ACTION",
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updatePriceReviewRequest", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/artworks/updatePriceReviewRequest (integration)", () => {
  afterEach(async () => {
    await PriceReview.deleteMany({});
  });

  it("accepts an offer and updates the review status to APPROVED_COUNTER_PRICE", async () => {
    const review = await PriceReview.create(makePriceReview());

    const response = await PATCH(
      makeRequest({ artist_id: ARTIST_ID, review_id: review._id.toString(), action: "ACCEPT" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Offer accepted");

    const updated = await PriceReview.findById(review._id).lean();
    expect(updated!.status).toBe("APPROVED_COUNTER_PRICE");
  });

  it("declines an offer and updates the review status to DECLINED_BY_ARTIST", async () => {
    const review = await PriceReview.create(makePriceReview());

    const response = await PATCH(
      makeRequest({ artist_id: ARTIST_ID, review_id: review._id.toString(), action: "DECLINE" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);

    const updated = await PriceReview.findById(review._id).lean();
    expect(updated!.status).toBe("DECLINED_BY_ARTIST");
  });

  it("returns 400 when review is not in PENDING_ARTIST_ACTION status", async () => {
    const review = await PriceReview.create(
      makePriceReview({ status: "PENDING_ADMIN_REVIEW" }),
    );

    const response = await PATCH(
      makeRequest({ artist_id: ARTIST_ID, review_id: review._id.toString(), action: "ACCEPT" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 when review does not exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const response = await PATCH(
      makeRequest({ artist_id: ARTIST_ID, review_id: fakeId, action: "ACCEPT" }),
    );

    expect(response.status).toBe(404);
  });

  it("returns 400 when action is invalid", async () => {
    const review = await PriceReview.create(makePriceReview());

    const response = await PATCH(
      makeRequest({ artist_id: ARTIST_ID, review_id: review._id.toString(), action: "MAYBE" }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when review_id is missing", async () => {
    const response = await PATCH(
      makeRequest({ artist_id: ARTIST_ID, action: "ACCEPT" }),
    );

    expect(response.status).toBe(400);
  });
});
