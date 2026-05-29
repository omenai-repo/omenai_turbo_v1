import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/events/GalleryEventSchema", () => ({
  GalleryEvent: { create: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    updateMany: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("@omenai/upstash-config", () => ({
  redis: {
    pipeline: vi.fn(),
  },
}));

import { createGalleryEvent } from "../../../../../app/api/services/gallery/events/createGalleryEvent.service";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { redis } from "@omenai/upstash-config";

const mockNewEvent = {
  event_id: "evt-001",
  title: "Emergence",
  gallery_id: "gallery-1",
};

const mockArtworks = [{ art_id: "art-1", title: "Piece" }];

const mockPipeline = {
  set: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue([]),
};

function setupFindChain(docs: any[]) {
  vi.mocked(Artworkuploads.find).mockReturnValue({
    lean: vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue(docs),
    }),
  } as any);
}

describe("createGalleryEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GalleryEvent.create).mockResolvedValue(mockNewEvent as any);
    vi.mocked(Artworkuploads.updateMany).mockResolvedValue({ modifiedCount: 1 } as any);
    setupFindChain(mockArtworks);
    vi.mocked(redis.pipeline).mockReturnValue(mockPipeline as any);
  });

  it("returns isOk:true with event on success", async () => {
    const result = await createGalleryEvent({
      title: "Emergence",
      gallery_id: "gallery-1",
      featured_artworks: ["art-1"],
    } as any);

    expect(result.isOk).toBe(true);
    expect(result.message).toBe("Event successfully created");
    expect(result.data).toEqual(mockNewEvent);
  });

  it("updates artwork exhibition_status when artworks are provided", async () => {
    await createGalleryEvent({
      title: "Emergence",
      gallery_id: "gallery-1",
      featured_artworks: ["art-1"],
    } as any);

    expect(Artworkuploads.updateMany).toHaveBeenCalledWith(
      { art_id: { $in: ["art-1"] } },
      expect.objectContaining({ $set: expect.objectContaining({ exhibition_status: expect.any(Object) }) }),
    );
  });

  it("caches updated artworks in Redis pipeline", async () => {
    await createGalleryEvent({
      title: "Emergence",
      gallery_id: "gallery-1",
      featured_artworks: ["art-1"],
    } as any);

    expect(redis.pipeline).toHaveBeenCalled();
    expect(mockPipeline.set).toHaveBeenCalledWith("artwork:art-1", JSON.stringify(mockArtworks[0]));
    expect(mockPipeline.exec).toHaveBeenCalled();
  });

  it("skips artwork update and cache when no featured artworks", async () => {
    await createGalleryEvent({
      title: "Empty Show",
      gallery_id: "gallery-1",
      featured_artworks: [],
    } as any);

    expect(Artworkuploads.updateMany).not.toHaveBeenCalled();
    expect(redis.pipeline).not.toHaveBeenCalled();
  });

  it("skips artwork update when featured_artworks is not provided", async () => {
    await createGalleryEvent({
      title: "No Artworks",
      gallery_id: "gallery-1",
    } as any);

    expect(Artworkuploads.updateMany).not.toHaveBeenCalled();
  });

  it("returns isOk:false when GalleryEvent.create throws", async () => {
    vi.mocked(GalleryEvent.create).mockRejectedValue(new Error("DB error"));

    const result = await createGalleryEvent({ title: "Fail", gallery_id: "g1" } as any);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Failed to create programming event. Please try again.");
  });
});
