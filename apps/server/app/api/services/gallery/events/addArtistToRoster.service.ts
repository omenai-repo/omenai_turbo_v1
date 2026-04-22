// src/services/roster/addArtistToRoster.service.ts
import { generateGhostArtistStub } from "@omenai/shared-lib/auth/generateGhostArtist";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

import {
  AddArtistToRosterInput,
  AddArtistToRosterSchema,
} from "@omenai/shared-lib/roster/rosterManagement.schema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  ServerError,
  BadRequestError,
} from "../../../../../custom/errors/dictionary/errorDictionary";

export async function addArtistToRosterLogic(
  rawData: unknown,
  gallery_id: string, // Passed in from your authenticated API route session
) {
  // 1. Strict Validation
  const data: AddArtistToRosterInput = AddArtistToRosterSchema.parse(rawData);

  await connectMongoDB();

  let finalArtistId = data.artist_id;

  // 2. Handle New Ghost Artist Creation
  if (!finalArtistId && data.newGhostData) {
    const ghostPayload = generateGhostArtistStub(data.newGhostData.name);

    // Merge in the newly migrated fields if the gallery provided them
    ghostPayload.birthyear = data.newGhostData.birthyear || "";
    ghostPayload.country_of_origin = data.newGhostData.country_of_origin || "";

    const newGhostArtist = await AccountArtist.create(ghostPayload);

    if (!newGhostArtist) {
      throw new ServerError(
        "Failed to generate artist profile, please try again",
      );
    }

    finalArtistId = newGhostArtist.artist_id;
  }

  if (!finalArtistId) {
    throw new BadRequestError("Artist mapping failed.");
  }

  // 3. Update the Gallery Roster
  const updatedGallery = await AccountGallery.findOneAndUpdate(
    { gallery_id: gallery_id },
    { $addToSet: { represented_artists: finalArtistId } }, // $addToSet prevents duplicates
    { new: true },
  );

  if (!updatedGallery) {
    throw new ServerError("Failed to update gallery roster.");
  }

  return {
    message: "Artist successfully added to roster",
    artist_id: finalArtistId,
  };
}
