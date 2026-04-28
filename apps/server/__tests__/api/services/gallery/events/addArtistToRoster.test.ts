import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { findOneAndUpdate: vi.fn() },
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { create: vi.fn() },
}));

vi.mock("@omenai/shared-lib/auth/generateGhostArtist", () => ({
  generateGhostArtistStub: vi.fn().mockReturnValue({
    name: "Ghost Artist",
    artist_id: "ghost-artist-id",
    birthyear: "",
    country_of_origin: "",
  }),
}));

vi.mock("@omenai/shared-lib/roster/rosterManagement.schema", () => ({
  AddArtistToRosterSchema: { parse: vi.fn() },
}));

import { addArtistToRosterLogic } from "../../../../../app/api/services/gallery/events/addArtistToRoster.service";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AddArtistToRosterSchema } from "@omenai/shared-lib/roster/rosterManagement.schema";
import { generateGhostArtistStub } from "@omenai/shared-lib/auth/generateGhostArtist";

const mockGallery = { gallery_id: "gallery-1", represented_artists: ["artist-1"] };

describe("addArtistToRosterLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AccountGallery.findOneAndUpdate).mockResolvedValue(mockGallery as any);
  });

  describe("adding an existing artist by ID", () => {
    beforeEach(() => {
      vi.mocked(AddArtistToRosterSchema.parse).mockReturnValue({
        artist_id: "artist-existing",
      } as any);
    });

    it("returns message and artist_id on success", async () => {
      const result = await addArtistToRosterLogic({ artist_id: "artist-existing" }, "gallery-1");

      expect(result.message).toBe("Artist successfully added to roster");
      expect(result.artist_id).toBe("artist-existing");
    });

    it("calls findOneAndUpdate with $addToSet", async () => {
      await addArtistToRosterLogic({ artist_id: "artist-existing" }, "gallery-1");

      expect(AccountGallery.findOneAndUpdate).toHaveBeenCalledWith(
        { gallery_id: "gallery-1" },
        { $addToSet: { represented_artists: "artist-existing" } },
        { new: true },
      );
    });

    it("throws ServerError when gallery is not found", async () => {
      vi.mocked(AccountGallery.findOneAndUpdate).mockResolvedValue(null);

      await expect(
        addArtistToRosterLogic({ artist_id: "artist-existing" }, "gallery-1"),
      ).rejects.toThrow("Failed to update gallery roster.");
    });
  });

  describe("creating a ghost artist", () => {
    beforeEach(() => {
      vi.mocked(AddArtistToRosterSchema.parse).mockReturnValue({
        artist_id: undefined,
        newGhostData: { name: "Ghost Artist", birthyear: "1980", country_of_origin: "NG" },
      } as any);
      vi.mocked(AccountArtist.create).mockResolvedValue({
        artist_id: "ghost-artist-id",
      } as any);
    });

    it("creates a ghost artist and uses its ID", async () => {
      const result = await addArtistToRosterLogic(
        { newGhostData: { name: "Ghost Artist" } },
        "gallery-1",
      );

      expect(AccountArtist.create).toHaveBeenCalled();
      expect(result.artist_id).toBe("ghost-artist-id");
    });

    it("calls generateGhostArtistStub with ghost name", async () => {
      await addArtistToRosterLogic(
        { newGhostData: { name: "Ghost Artist", birthyear: "1980", country_of_origin: "NG" } },
        "gallery-1",
      );

      expect(generateGhostArtistStub).toHaveBeenCalledWith("Ghost Artist");
    });

    it("throws ServerError when AccountArtist.create returns falsy", async () => {
      vi.mocked(AccountArtist.create).mockResolvedValue(null as any);

      await expect(
        addArtistToRosterLogic({ newGhostData: { name: "Ghost" } }, "gallery-1"),
      ).rejects.toThrow("Failed to generate artist profile");
    });
  });

  it("throws when schema validation fails", async () => {
    vi.mocked(AddArtistToRosterSchema.parse).mockImplementation(() => {
      throw new Error("Validation failed");
    });

    await expect(addArtistToRosterLogic({}, "gallery-1")).rejects.toThrow("Validation failed");
  });

  it("throws BadRequestError when neither artist_id nor newGhostData is provided", async () => {
    vi.mocked(AddArtistToRosterSchema.parse).mockReturnValue({
      artist_id: undefined,
      newGhostData: undefined,
    } as any);

    await expect(addArtistToRosterLogic({}, "gallery-1")).rejects.toThrow(
      "Artist mapping failed.",
    );
  });
});
