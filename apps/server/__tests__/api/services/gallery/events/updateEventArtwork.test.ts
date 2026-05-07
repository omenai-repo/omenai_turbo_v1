import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { findOneAndUpdate: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    findOneAndUpdate: vi.fn(),
    updateMany: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {
    set: vi.fn().mockResolvedValue("OK"),
    pipeline: vi.fn(),
  },
}));

import {
  removeArtworkFromEvent,
  addArtworksToEvent,
} from "../../../../../app/api/services/gallery/events/updateEventArtwork.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { redis } from "@omenai/upstash-config";

const mockEvent = { event_id: "evt-001", title: "Show", gallery_id: "gallery-1", featured_artworks: [] };
const mockArtwork = { art_id: "art-1", title: "Piece", exhibition_status: null };
const mockPipeline = { set: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue([]) };

describe("removeArtworkFromEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(mockEvent as any);
    vi.mocked(Artworkuploads.findOneAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockArtwork),
    } as any);
    vi.mocked(redis.set).mockResolvedValue("OK" as any);
  });

  it("returns isOk:true on successful removal", async () => {
    const result = await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Artwork successfully removed.");
  });

  it("pulls artwork ID from event featured_artworks", async () => {
    await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { event_id: "evt-001", gallery_id: "gallery-1" },
      { $pull: { featured_artworks: "art-1" } },
      { new: true },
    );
  });

  it("frees the artwork by setting exhibition_status to null", async () => {
    await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(Artworkuploads.findOneAndUpdate).toHaveBeenCalledWith(
      { art_id: "art-1", author_id: "gallery-1" },
      { $set: { exhibition_status: null } },
      { new: true },
    );
  });

  it("updates Redis cache after freeing artwork", async () => {
    await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(redis.set).toHaveBeenCalledWith("artwork:art-1", JSON.stringify(mockArtwork));
  });

  it("skips Redis cache update when artwork not found in DB", async () => {
    vi.mocked(Artworkuploads.findOneAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(redis.set).not.toHaveBeenCalled();
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(null);

    const result = await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found or unauthorized.");
  });

  it("returns isOk:false when an error is thrown", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockRejectedValue(new Error("DB error"));

    const result = await removeArtworkFromEvent("evt-001", "art-1", "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error during removal.");
  });
});

describe("addArtworksToEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(mockEvent as any);
    vi.mocked(Artworkuploads.updateMany).mockResolvedValue({ modifiedCount: 2 } as any);
    vi.mocked(Artworkuploads.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([mockArtwork]),
    } as any);
    vi.mocked(redis.pipeline).mockReturnValue(mockPipeline as any);
  });

  it("returns isOk:true on successful addition", async () => {
    const result = await addArtworksToEvent("evt-001", ["art-1", "art-2"], "gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Artworks successfully added to presentation.");
  });

  it("adds artwork IDs to event with $addToSet", async () => {
    await addArtworksToEvent("evt-001", ["art-1", "art-2"], "gallery-1");

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { event_id: "evt-001", gallery_id: "gallery-1" },
      { $addToSet: { featured_artworks: { $each: ["art-1", "art-2"] } } },
      { new: true },
    );
  });

  it("locks artworks with active exhibition_status", async () => {
    await addArtworksToEvent("evt-001", ["art-1", "art-2"], "gallery-1");

    expect(Artworkuploads.updateMany).toHaveBeenCalledWith(
      { art_id: { $in: ["art-1", "art-2"] }, author_id: "gallery-1" },
      expect.objectContaining({
        $set: { exhibition_status: expect.objectContaining({ status: "active" }) },
      }),
    );
  });

  it("caches updated artworks via Redis pipeline", async () => {
    await addArtworksToEvent("evt-001", ["art-1"], "gallery-1");

    expect(redis.pipeline).toHaveBeenCalled();
    expect(mockPipeline.set).toHaveBeenCalledWith("artwork:art-1", JSON.stringify(mockArtwork));
    expect(mockPipeline.exec).toHaveBeenCalled();
  });

  it("returns isOk:false when artworkIds is empty", async () => {
    const result = await addArtworksToEvent("evt-001", [], "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("No artworks provided.");
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(null);

    const result = await addArtworksToEvent("evt-001", ["art-1"], "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found or unauthorized.");
  });

  it("returns isOk:false when an error is thrown", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockRejectedValue(new Error("DB error"));

    const result = await addArtworksToEvent("evt-001", ["art-1"], "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal server error during addition.");
  });
});
