import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema", () => ({
  PriceReview: { findOne: vi.fn() },
}));
vi.mock("../../../app/api/services/uploadArtwork.service", () => ({
  uploadArtworkLogic: vi.fn().mockResolvedValue({ message: "uploaded" }),
}));
vi.mock("../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { PATCH } from "../../../app/api/artworks/updatePriceReviewRequest/route";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { uploadArtworkLogic } from "../../../app/api/services/uploadArtwork.service";

const mockSave = vi.fn().mockResolvedValue(undefined);
const mockReview = {
  _id: "review-123",
  artist_id: "artist-abc",
  status: "PENDING_ARTIST_ACTION",
  meta: { artwork: { title: "Sunset" } },
  save: mockSave,
};

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/artworks/updatePriceReviewRequest", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockFindOne(value: any) {
  vi.mocked(PriceReview.findOne).mockResolvedValue(value as any);
}

describe("PATCH /api/artworks/updatePriceReviewRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOne({ ...mockReview, save: mockSave });
  });

  it("sets status to APPROVED_COUNTER_PRICE and calls uploadArtworkLogic when action is ACCEPT", async () => {
    const review = { ...mockReview, save: mockSave };
    mockFindOne(review);

    const response = await PATCH(
      makeRequest({ artist_id: "artist-abc", review_id: "review-123", action: "ACCEPT" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(review.status).toBe("APPROVED_COUNTER_PRICE");
    expect(uploadArtworkLogic).toHaveBeenCalledWith(mockReview.meta.artwork);
  });

  it("sets status to DECLINED_BY_ARTIST and does not upload when action is DECLINE", async () => {
    const review = { ...mockReview, save: mockSave };
    mockFindOne(review);

    const response = await PATCH(
      makeRequest({ artist_id: "artist-abc", review_id: "review-123", action: "DECLINE" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(review.status).toBe("DECLINED_BY_ARTIST");
    expect(uploadArtworkLogic).not.toHaveBeenCalled();
  });

  it("returns 404 when review is not found", async () => {
    mockFindOne(null);

    const response = await PATCH(
      makeRequest({ artist_id: "artist-abc", review_id: "missing-id", action: "ACCEPT" }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Review not found");
  });

  it("returns 400 when review is not in PENDING_ARTIST_ACTION status", async () => {
    mockFindOne({ ...mockReview, status: "AUTO_APPROVED", save: mockSave });

    const response = await PATCH(
      makeRequest({ artist_id: "artist-abc", review_id: "review-123", action: "ACCEPT" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("No pending offer to resolve");
  });

  it("returns 400 when required fields fail validation", async () => {
    const response = await PATCH(makeRequest({ artist_id: "artist-abc" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/Validation failed/i);
  });

  it("returns 400 when action is not a valid enum value", async () => {
    const response = await PATCH(
      makeRequest({ artist_id: "artist-abc", review_id: "review-123", action: "APPROVE" }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
