// src/services/roster/fetchGalleryRoster.service.ts
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";

export async function fetchGalleryRosterLogic(gallery_id: string | null) {
  if (!gallery_id) {
    throw new BadRequestError("Gallery ID is required to fetch roster.");
  }

  // 1. Get the gallery's array of IDs
  const gallery = await AccountGallery.findOne(
    { gallery_id: gallery_id },
    "represented_artists", // Only fetch this specific field
  );

  if (!gallery) {
    throw new NotFoundError("Gallery account not found.");
  }

  const artistIds = gallery.represented_artists || [];

  // If the roster is empty, fail gracefully and return an empty array
  if (artistIds.length === 0) {
    return {
      message: "Roster fetched successfully",
      roster: [],
    };
  }

  // 2. Hydrate the IDs into actual artist profiles
  const roster = await AccountArtist.find({
    artist_id: { $in: artistIds },
  })
    .sort({ createdAt: -1 })
    .select(
      "artist_id name profile_status artist_verified logo birthyear country_of_origin",
    );

  return {
    message: "Roster fetched successfully",
    roster: roster,
  };
}
