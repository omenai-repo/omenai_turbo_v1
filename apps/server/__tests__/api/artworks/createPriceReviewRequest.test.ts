import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
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
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema", () => ({
  PriceReview: vi.fn().mockImplementation((data: any) => ({
    ...data,
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));
vi.mock("../../../app/api/services/uploadArtwork.service", () => ({
  uploadArtworkLogic: vi.fn().mockResolvedValue({ message: "uploaded" }),
}));
vi.mock("@omenai/shared-emails/src/models/artist/sendPriceReviewRequest", () => ({
  sendPriceReviewRequest: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-emails/src/models/admin/sendArtworkPriceReviewEmail", () => ({
  sendArtworkPriceReviewEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

import { POST } from "../../../app/api/artworks/createPriceReviewRequest/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { uploadArtworkLogic } from "../../../app/api/services/uploadArtwork.service";
import { sendPriceReviewRequest } from "@omenai/shared-emails/src/models/artist/sendPriceReviewRequest";

const anchorPrice = 1000;
const mockMeta = {
  artwork: { title: "Sunset", art_id: "art-123" },
  algorithm_recommendation: { priceRange: [600, 700, 800, anchorPrice, 1100, 1200] },
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/createPriceReviewRequest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockArtist(overrides: Partial<{
  pricing_allowances: { auto_approvals_used: number; last_reset_date: Date };
  categorization: string;
}> = {}) {
  const artist = {
    artist_id: "artist-123",
    name: "Test Artist",
    email: "artist@example.com",
    categorization: overrides.categorization ?? "Emerging",
    pricing_allowances: {
      auto_approvals_used: overrides.pricing_allowances?.auto_approvals_used ?? 0,
      last_reset_date: overrides.pricing_allowances?.last_reset_date ?? new Date(),
    },
    save: vi.fn().mockResolvedValue(undefined),
  };
  vi.mocked(AccountArtist.findOne).mockResolvedValue(artist as any);
  return artist;
}

describe("POST /api/artworks/createPriceReviewRequest", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("auto-approval", () => {
    it("auto-approves when usage is below the cap and price is within variance", async () => {
      // Emerging variance = 10%, anchorPrice = 1000 → maxAllowed = 1100
      mockArtist({ categorization: "Emerging" });
      const requestedPrice = 1050; // within 10% of anchor (1000)

      const response = await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: requestedPrice },
          meta: mockMeta,
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.status).toBe("AUTO_APPROVED");
    });

    it("calls uploadArtworkLogic immediately for auto-approved reviews", async () => {
      mockArtist({ categorization: "Emerging" });

      await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: 1050 },
          meta: mockMeta,
        }),
      );

      expect(uploadArtworkLogic).toHaveBeenCalledWith(mockMeta.artwork);
    });

    it("increments auto_approvals_used after auto-approval", async () => {
      const artist = mockArtist({ categorization: "Emerging" });

      await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: 1050 },
          meta: mockMeta,
        }),
      );

      expect(artist.pricing_allowances.auto_approvals_used).toBe(1);
      expect(artist.save).toHaveBeenCalled();
    });
  });

  describe("pending admin review", () => {
    it("sends to admin review when usage cap (3) is reached", async () => {
      mockArtist({ pricing_allowances: { auto_approvals_used: 3, last_reset_date: new Date() } });

      const response = await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: 1050 },
          meta: mockMeta,
        }),
      );
      const body = await response.json();

      expect(body.status).toBe("PENDING_ADMIN_REVIEW");
      expect(uploadArtworkLogic).not.toHaveBeenCalled();
    });

    it("sends to admin review when price exceeds the allowed variance", async () => {
      // Emerging variance = 10%, so price > 1100 triggers pending review
      mockArtist({ categorization: "Emerging" });

      const response = await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: 1500 },
          meta: mockMeta,
        }),
      );
      const body = await response.json();

      expect(body.status).toBe("PENDING_ADMIN_REVIEW");
    });

    it("sends confirmation emails to artist and admin for pending reviews", async () => {
      mockArtist({ categorization: "Emerging" });

      await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: 1500 },
          meta: mockMeta,
        }),
      );

      expect(sendPriceReviewRequest).toHaveBeenCalledOnce();
    });
  });

  describe("monthly rollover", () => {
    it("resets usage count when more than 30 days have passed since last reset", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      const artist = mockArtist({
        pricing_allowances: { auto_approvals_used: 3, last_reset_date: oldDate },
        categorization: "Emerging",
      });

      const response = await POST(
        makeRequest({
          artist_id: "artist-123",
          artist_review: { requested_price: 1050 },
          meta: mockMeta,
        }),
      );
      const body = await response.json();

      // After rollover, usage is 0 → auto-approval should be possible
      expect(body.status).toBe("AUTO_APPROVED");
    });
  });

  it("returns 404 when artist is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null as any);

    const response = await POST(
      makeRequest({
        artist_id: "missing-artist",
        artist_review: { requested_price: 1000 },
        meta: mockMeta,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toBe("Artist not found");
  });
});
