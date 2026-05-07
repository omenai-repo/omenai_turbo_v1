import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { findOneAndUpdate: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: { updateMany: vi.fn() },
}));

import { archiveGalleryEvent } from "../../../../../app/api/services/gallery/events/archiveGalleryEvent.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const mockArchivedEvent = {
  event_id: "evt-001",
  title: "Old Show",
  gallery_id: "gallery-1",
  featured_artworks: ["art-1", "art-2"],
  is_archived: true,
};

describe("archiveGalleryEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(mockArchivedEvent as any);
    vi.mocked(Artworkuploads.updateMany).mockResolvedValue({ modifiedCount: 2 } as any);
  });

  it("returns isOk:true on successful archive", async () => {
    const result = await archiveGalleryEvent("evt-001", "gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Event successfully archived.");
  });

  it("sets is_archived to true on the event", async () => {
    await archiveGalleryEvent("evt-001", "gallery-1");

    expect(GalleryEvent.findOneAndUpdate).toHaveBeenCalledWith(
      { event_id: "evt-001", gallery_id: "gallery-1" },
      { $set: { is_archived: true } },
      { new: true },
    );
  });

  it("updates artworks exhibition_status to completed", async () => {
    await archiveGalleryEvent("evt-001", "gallery-1");

    expect(Artworkuploads.updateMany).toHaveBeenCalledWith(
      { art_id: { $in: ["art-1", "art-2"] } },
      expect.objectContaining({
        $set: { exhibition_status: expect.objectContaining({ status: "completed" }) },
      }),
    );
  });

  it("skips artwork update when event has no featured artworks", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue({
      ...mockArchivedEvent,
      featured_artworks: [],
    } as any);

    await archiveGalleryEvent("evt-001", "gallery-1");

    expect(Artworkuploads.updateMany).not.toHaveBeenCalled();
  });

  it("returns isOk:false when event is not found", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockResolvedValue(null);

    const result = await archiveGalleryEvent("evt-001", "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Event not found or unauthorized.");
  });

  it("returns isOk:false when findOneAndUpdate throws", async () => {
    vi.mocked(GalleryEvent.findOneAndUpdate).mockRejectedValue(new Error("DB error"));

    const result = await archiveGalleryEvent("evt-001", "gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Failed to archive event.");
  });
});
