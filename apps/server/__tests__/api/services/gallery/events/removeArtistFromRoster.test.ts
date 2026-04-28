import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOneAndUpdate: vi.fn() },
}));

import { removeArtistFromRosterLogic } from "../../../../../app/api/services/gallery/events/removeArtistFromRoster.service";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const mockGallery = { gallery_id: "gallery-1", represented_artists: [] };

describe("removeArtistFromRosterLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOneAndUpdate).mockResolvedValue(mockGallery as any);
  });

  it("returns success message when artist is removed", async () => {
    const result = await removeArtistFromRosterLogic("artist-1", "gallery-1");

    expect(result.message).toBe("Artist successfully removed from roster");
  });

  it("calls findOneAndUpdate with $pull to remove artist", async () => {
    await removeArtistFromRosterLogic("artist-1", "gallery-1");

    expect(AccountGallery.findOneAndUpdate).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      { $pull: { represented_artists: "artist-1" } },
      { new: true },
    );
  });

  it("throws BadRequestError when artist_id is empty string", async () => {
    await expect(removeArtistFromRosterLogic("", "gallery-1")).rejects.toThrow(
      "Artist ID is required to remove from roster.",
    );
  });

  it("throws ServerError when gallery is not found", async () => {
    vi.mocked(AccountGallery.findOneAndUpdate).mockResolvedValue(null);

    await expect(removeArtistFromRosterLogic("artist-1", "gallery-1")).rejects.toThrow(
      "Failed to update gallery roster.",
    );
  });

  it("propagates DB errors", async () => {
    vi.mocked(AccountGallery.findOneAndUpdate).mockRejectedValue(new Error("DB connection lost"));

    await expect(removeArtistFromRosterLogic("artist-1", "gallery-1")).rejects.toThrow(
      "DB connection lost",
    );
  });
});
