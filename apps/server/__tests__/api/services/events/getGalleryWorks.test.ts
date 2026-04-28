import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
}));

import { getGalleryWorksService } from "../../../../app/api/services/events/getGalleryWorks.service";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../../app/api/artworks/utils";

const mockArtDoc = { art_id: "art-1" };
const mockFullArtwork = { art_id: "art-1", title: "Piece One", pricing: { price: 500 } };

function setupFindChain(docs: any[]) {
  vi.mocked(Artworkuploads.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue(docs),
          }),
        }),
      }),
    }),
  } as any);
}

describe("getGalleryWorksService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Artworkuploads.countDocuments).mockResolvedValue(1);
    setupFindChain([mockArtDoc]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue([mockFullArtwork]);
  });

  it("returns isOk:true with artworks and pagination", async () => {
    const result = await getGalleryWorksService("gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual([mockFullArtwork]);
    expect(result.pagination?.total).toBe(1);
    expect(result.pagination?.totalPages).toBe(1);
  });

  it("queries artworks for the correct gallery_id", async () => {
    await getGalleryWorksService("gallery-1");

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({ author_id: "gallery-1" }),
    );
  });

  it("applies artist filter when provided", async () => {
    await getGalleryWorksService("gallery-1", 1, 20, { artist: "artist-A" });

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({ artist_id: "artist-A" }),
    );
  });

  it("ignores artist filter when value is All", async () => {
    await getGalleryWorksService("gallery-1", 1, 20, { artist: "All" });

    const callArg = vi.mocked(Artworkuploads.find).mock.calls[0][0] as any;
    expect(callArg.artist_id).toBeUndefined();
  });

  it("applies medium filter when provided", async () => {
    await getGalleryWorksService("gallery-1", 1, 20, { medium: "Oil" });

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({ medium: "Oil" }),
    );
  });

  it("applies Under 1000 price filter", async () => {
    await getGalleryWorksService("gallery-1", 1, 20, { price: "Under 1000" });

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({ "pricing.price": { $lt: 1000 } }),
    );
  });

  it("applies 1000-5000 price range filter", async () => {
    await getGalleryWorksService("gallery-1", 1, 20, { price: "1000-5000" });

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({ "pricing.price": { $gte: 1000, $lte: 5000 } }),
    );
  });

  it("applies Over 10000 price filter", async () => {
    await getGalleryWorksService("gallery-1", 1, 20, { price: "Over 10000" });

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({ "pricing.price": { $gt: 10000 } }),
    );
  });

  it("calculates correct pagination for page 2", async () => {
    vi.mocked(Artworkuploads.countDocuments).mockResolvedValue(40);

    const result = await getGalleryWorksService("gallery-1", 2, 20);

    expect(result.pagination?.page).toBe(2);
    expect(result.pagination?.totalPages).toBe(2);
  });

  it("returns isOk:false when an error is thrown", async () => {
    vi.mocked(Artworkuploads.countDocuments).mockRejectedValue(new Error("DB error"));

    const result = await getGalleryWorksService("gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal Server Error");
  });
});
