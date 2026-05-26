import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-models/models/artworks/UploadArtworkSchema", () => ({
  Artworkuploads: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../../../../../app/api/artworks/utils", () => ({
  fetchArtworksFromCache: vi.fn(),
}));

import { fetchAvailableInventory } from "../../../../../app/api/services/gallery/events/fetchGalleryArtworkInventory.service";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../../../app/api/artworks/utils";

const mockArtDocs = [{ art_id: "art-1" }, { art_id: "art-2" }];
const mockFullArtworks = [
  { art_id: "art-1", title: "Piece One" },
  { art_id: "art-2", title: "Piece Two" },
];

function setupFindChain(docs: any[]) {
  vi.mocked(Artworkuploads.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      skip: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            lean: vi.fn().mockReturnValue({
              exec: vi.fn().mockResolvedValue(docs),
            }),
          }),
        }),
      }),
    }),
  } as any);
}

describe("fetchAvailableInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFindChain(mockArtDocs);
    vi.mocked(Artworkuploads.countDocuments).mockResolvedValue(2);
    vi.mocked(fetchArtworksFromCache).mockResolvedValue(mockFullArtworks);
  });

  it("returns isOk:true with artworks and pagination", async () => {
    const result = await fetchAvailableInventory("gallery-1");

    expect(result.isOk).toBe(true);
    expect(result.data).toEqual(mockFullArtworks);
    expect(result.pagination?.total).toBe(2);
  });

  it("queries only available artworks that are not locked in events", async () => {
    await fetchAvailableInventory("gallery-1");

    expect(Artworkuploads.find).toHaveBeenCalledWith(
      expect.objectContaining({
        author_id: "gallery-1",
        availability: true,
      }),
    );
  });

  it("passes art_ids to fetchArtworksFromCache", async () => {
    await fetchAvailableInventory("gallery-1");

    expect(fetchArtworksFromCache).toHaveBeenCalledWith(["art-1", "art-2"]);
  });

  it("calculates hasMore correctly when more items exist", async () => {
    vi.mocked(Artworkuploads.countDocuments).mockResolvedValue(25);

    const result = await fetchAvailableInventory("gallery-1", 1, 20);

    expect(result.pagination?.hasMore).toBe(true);
  });

  it("calculates hasMore false when all items fit", async () => {
    const result = await fetchAvailableInventory("gallery-1", 1, 20);

    expect(result.pagination?.hasMore).toBe(false);
  });

  it("adds search_term to query when provided", async () => {
    await fetchAvailableInventory("gallery-1", 1, 20, "sunset");

    const queryArg = vi.mocked(Artworkuploads.find).mock.calls[0][0] as any;
    const orConditions = queryArg.$or;
    const hasSearchCondition = orConditions.some(
      (c: any) => c.title?.$regex === "sunset" || c.artist?.$regex === "sunset",
    );
    expect(hasSearchCondition).toBe(true);
  });

  it("returns isOk:false when an error is thrown", async () => {
    vi.mocked(Artworkuploads.countDocuments).mockRejectedValue(new Error("DB error"));

    const result = await fetchAvailableInventory("gallery-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Failed to load inventory.");
    expect(result.data).toEqual([]);
    expect(result.pagination).toBeNull();
  });
});
