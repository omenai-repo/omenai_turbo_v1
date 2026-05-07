import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOne: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { find: vi.fn() },
}));

import { fetchGalleryRosterLogic } from "../../../../../app/api/services/gallery/events/fetchGalleryRoster.service";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

const mockGallery = { gallery_id: "gallery-1", represented_artists: ["artist-1", "artist-2"] };
const mockRoster = [
  { artist_id: "artist-1", name: "Amara" },
  { artist_id: "artist-2", name: "Kofi" },
];

function setupArtistFindChain(docs: any[]) {
  vi.mocked(AccountArtist.find).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(docs),
    }),
  } as any);
}

describe("fetchGalleryRosterLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOne).mockResolvedValue(mockGallery as any);
    setupArtistFindChain(mockRoster);
  });

  it("returns roster on success", async () => {
    const result = await fetchGalleryRosterLogic("gallery-1");

    expect(result.message).toBe("Roster fetched successfully");
    expect(result.roster).toEqual(mockRoster);
  });

  it("queries gallery by gallery_id and fetches only represented_artists field", async () => {
    await fetchGalleryRosterLogic("gallery-1");

    expect(AccountGallery.findOne).toHaveBeenCalledWith(
      { gallery_id: "gallery-1" },
      "represented_artists",
    );
  });

  it("queries AccountArtist with all represented artist IDs", async () => {
    await fetchGalleryRosterLogic("gallery-1");

    expect(AccountArtist.find).toHaveBeenCalledWith({
      artist_id: { $in: ["artist-1", "artist-2"] },
    });
  });

  it("returns empty roster when no artists are represented", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue({
      gallery_id: "gallery-1",
      represented_artists: [],
    } as any);

    const result = await fetchGalleryRosterLogic("gallery-1");

    expect(result.roster).toEqual([]);
    expect(AccountArtist.find).not.toHaveBeenCalled();
  });

  it("throws BadRequestError when gallery_id is null", async () => {
    await expect(fetchGalleryRosterLogic(null)).rejects.toThrow(
      "Gallery ID is required to fetch roster.",
    );
  });

  it("throws NotFoundError when gallery account is not found", async () => {
    vi.mocked(AccountGallery.findOne).mockResolvedValue(null);

    await expect(fetchGalleryRosterLogic("gallery-1")).rejects.toThrow(
      "Gallery account not found.",
    );
  });

  it("propagates DB errors", async () => {
    vi.mocked(AccountGallery.findOne).mockRejectedValue(new Error("DB failure"));

    await expect(fetchGalleryRosterLogic("gallery-1")).rejects.toThrow("DB failure");
  });
});
