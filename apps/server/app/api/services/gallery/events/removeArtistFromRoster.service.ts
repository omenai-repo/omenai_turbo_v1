// src/services/roster/removeArtistFromRoster.service.ts
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";

export async function removeArtistFromRosterLogic(
  artist_id: string,
  gallery_id: string,
) {
  if (!artist_id) {
    throw new BadRequestError("Artist ID is required to remove from roster.");
  }

  await connectMongoDB();

  // $pull removes the specific ID from the represented_artists array
  const updatedGallery = await AccountGallery.findOneAndUpdate(
    { gallery_id: gallery_id },
    { $pull: { represented_artists: artist_id } },
    { new: true },
  );

  if (!updatedGallery) {
    throw new ServerError("Failed to update gallery roster.");
  }

  return {
    message: "Artist successfully removed from roster",
  };
}
