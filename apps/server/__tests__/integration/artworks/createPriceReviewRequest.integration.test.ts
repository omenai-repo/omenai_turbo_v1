import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { POST } from "../../../app/api/artworks/createPriceReviewRequest/route";

// External side-effects that must not run in tests.
vi.mock("@omenai/shared-emails/src/models/artist/sendPriceReviewRequest", () => ({
  sendPriceReviewRequest: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-emails/src/models/admin/sendArtworkPriceReviewEmail", () => ({
  sendArtworkPriceReviewEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../app/api/services/uploadArtwork.service", () => ({
  uploadArtworkLogic: vi.fn().mockResolvedValue(undefined),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeArtist(overrides: Record<string, any> = {}) {
  const uid = crypto.randomUUID();
  return {
    name: "Test Artist",
    profile_status: "ghost",
    artist_id: `artist-${uid}`,
    verified: false,
    artist_verified: false,
    categorization: "Emerging",
    documentation: {
      cv: "",
      socials: { instagram: "", twitter: "", facebook: "", linkedin: "" },
    },
    pricing_allowances: {
      auto_approvals_used: 0,
      last_reset_date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    ...overrides,
  };
}

const ALGORITHM_RECOMMENDATION = {
  recommendedPrice: 1200,
  priceRange: [800, 1000, 1200, 1400, 1600, 1800],
  meanPrice: 1200,
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/createPriceReviewRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/artworks/createPriceReviewRequest (integration)", () => {
  afterEach(async () => {
    await AccountArtist.deleteMany({});
    await PriceReview.deleteMany({});
  });

  it("returns 404 when artist does not exist", async () => {
    const response = await POST(
      makeRequest({
        artist_id: "non-existent",
        artist_review: {
          requested_price: 1500,
          justification_type: "OTHER",
          justification_notes: "Test",
          justification_proof_url: "",
        },
        meta: {
          artwork: { title: "My Art" },
          algorithm_recommendation: ALGORITHM_RECOMMENDATION,
        },
      }),
    );

    expect(response.status).toBe(404);
  });

  it("creates a review with PENDING_ADMIN_REVIEW status when price exceeds auto-approval threshold", async () => {
    const artist = await AccountArtist.create(
      makeArtist({ pricing_allowances: { auto_approvals_used: 0, last_reset_date: new Date() } }),
    );

    // Price far above the auto-approval threshold for Emerging (anchorPrice * 1.10)
    const requestedPrice = ALGORITHM_RECOMMENDATION.priceRange[3] * 2;

    const response = await POST(
      makeRequest({
        artist_id: artist.artist_id,
        artist_review: {
          requested_price: requestedPrice,
          justification_type: "PAST_SALE",
          justification_notes: "Exhibition",
          justification_proof_url: "https://proof.example.com",
        },
        meta: {
          artwork: { title: "Overpriced Art" },
          algorithm_recommendation: ALGORITHM_RECOMMENDATION,
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe("PENDING_ADMIN_REVIEW");

    const savedReview = await PriceReview.findOne({ artist_id: artist.artist_id }).lean();
    expect(savedReview).toBeTruthy();
    expect(savedReview!.status).toBe("PENDING_ADMIN_REVIEW");
  });

  it("auto-approves a review when price is within threshold and monthly limit not reached", async () => {
    const artist = await AccountArtist.create(
      makeArtist({ pricing_allowances: { auto_approvals_used: 0, last_reset_date: new Date() } }),
    );

    // Price within 10% of anchorPrice (priceRange[3]) for Emerging tier
    const anchorPrice = ALGORITHM_RECOMMENDATION.priceRange[3]; // 1400
    const withinThreshold = Math.round(anchorPrice * 1.05); // 5% above anchor

    const response = await POST(
      makeRequest({
        artist_id: artist.artist_id,
        artist_review: {
          requested_price: withinThreshold,
          justification_type: "OTHER",
          justification_notes: "Auto-approved case",
          justification_proof_url: "",
        },
        meta: {
          artwork: { title: "Auto Art" },
          algorithm_recommendation: ALGORITHM_RECOMMENDATION,
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe("AUTO_APPROVED");
  });

  it("routes to PENDING_ADMIN_REVIEW when monthly auto-approval limit is exhausted", async () => {
    const artist = await AccountArtist.create(
      makeArtist({
        pricing_allowances: { auto_approvals_used: 3, last_reset_date: new Date() },
      }),
    );

    const anchorPrice = ALGORITHM_RECOMMENDATION.priceRange[3];
    const withinThreshold = Math.round(anchorPrice * 1.05);

    const response = await POST(
      makeRequest({
        artist_id: artist.artist_id,
        artist_review: {
          requested_price: withinThreshold,
          justification_type: "OTHER",
          justification_notes: "Limit exhausted",
          justification_proof_url: "",
        },
        meta: {
          artwork: { title: "Quota Art" },
          algorithm_recommendation: ALGORITHM_RECOMMENDATION,
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe("PENDING_ADMIN_REVIEW");
  });
});
