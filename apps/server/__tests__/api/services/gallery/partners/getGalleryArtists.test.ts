import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../../../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
}));

import { getGalleryArtistsService } from "../../../../../app/api/services/gallery/partners/getGalleryArtists.service";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../../../app/api/artworks/utils";

const mockGallery = { represented_artists: ["artist-1"] };
const mockArtistInfo = { name: "Amara", country_of_origin: "NG", birthyear: "1990" };
const mockArtworks = [{ art_id: "art-1", title: "Piece" }];

function setupArtworksFindChain(docs: any[]) {
  vi.mocked(Artworkuploads.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(docs),
        }),
      }),
    }),
  } as any);
}

describe("getGalleryArtistsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockGallery),
    } as any);
    vi.mocked(Artworkuploads.aggregate).mockResolvedValue([{ _id: "artist-1" }]);
    vi.mocked(AccountArtist.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockArtistInfo),
    } as any);
    vi.mocked(Artworkuploads.countDocuments).mockResolvedValue(3);
    setupArtworksFindChain([{ art_id: "art-1" }]);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockArtworks);
  });

  it("returns isOk:true with artist data and pagination", async () => {
    const result = await getGalleryArtistsService("gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.pagination?.total).toBeGreaterThan(0);
  });

  it("fetches the gallery's represented artist list", async () => {
    await getGalleryArtistsService("gallery-1");

    expect(AccountGallery.findOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      "represented_artists",
    );
  });

  it("uses aggregate to find artists with works in gallery", async () => {
    await getGalleryArtistsService("gallery-1");

    expect(Artworkuploads.aggregate).toHaveBeenCalledWith([
      { $match: { author_id: "gallery-1" } },
      { $group: { _id: "$artist_id" } },
    ]);
  });

  it("marks represented artists with isRepresented:true", async () => {
    const result = await getGalleryArtistsService("gallery-1");

    const representedArtist = result.data?.find((a: any) => a.artist_id === "artist-1");
    expect(representedArtist?.isRepresented).toBe(true);
  });

  it("fetches artworks from cache for each artist", async () => {
    await getGalleryArtistsService("gallery-1");

    expect(fetchArtworksFromCache).toHaveBeenCalled();
  });

  describe("single artist mode", () => {
    it("skips aggregate and fetches only the target artist when singleArtistId is provided", async () => {
      const result = await getGalleryArtistsService("gallery-1", 1, 5, "artist-1");

      expect(Artworkuploads.aggregate).not.toHaveBeenCalled();
      expect(result.data?.[0].artist_id).toBe("artist-1");
      expect(result.pagination?.total).toBe(1);
    });

    it("ignores singleArtistId when it is the string null", async () => {
      await getGalleryArtistsService("gallery-1", 1, 5, "null");

      expect(Artworkuploads.aggregate).toHaveBeenCalled();
    });

    it("ignores singleArtistId when it is the string undefined", async () => {
      await getGalleryArtistsService("gallery-1", 1, 5, "undefined");

      expect(Artworkuploads.aggregate).toHaveBeenCalled();
    });
  });

  it("returns correct totalPages in pagination", async () => {
    vi.mocked(Artworkuploads.aggregate).mockResolvedValue([
      { _id: "artist-1" },
      { _id: "artist-2" },
      { _id: "artist-3" },
      { _id: "artist-4" },
      { _id: "artist-5" },
      { _id: "artist-6" },
    ]);

    const result = await getGalleryArtistsService("gallery-1", 1, 5);

    expect(result.pagination?.totalPages).toBe(2);
  });

  it("returns isOk:false on error", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB error")),
    } as any);

    const result = await getGalleryArtistsService("gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Internal Server Error");
  });

  it("handles gallery with no represented artists gracefully", async () => {
    vi.mocked(AccountGallery.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const result = await getGalleryArtistsService("gallery-1");

    expect(result.isOk).toBe(true);
  });
});
