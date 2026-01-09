import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { processFailedJobs, handleDeleteWithRetry } from "./utils";

type Payload = {
  artistIds: string[];
  galleryIds: string[];
  userIds: string[];
};

async function anonymizeAccount(
  entityId: string,
  accountType: "artist" | "gallery" | "user"
) {
  const modelMap = {
    artist: { model: AccountArtist, field: "artist_id" },
    gallery: { model: AccountGallery, field: "gallery_id" },
    user: { model: AccountIndividual, field: "user_id" },
  };

  const { model, field } = modelMap[accountType];

  return handleDeleteWithRetry(entityId, () =>
    model.deleteOne({ [field]: entityId })
  );
}

export async function accountService(payload: Payload) {
  const allItems = [
    ...payload.artistIds.map((id) => ({ id, type: "artist" as const })),
    ...payload.galleryIds.map((id) => ({ id, type: "gallery" as const })),
    ...payload.userIds.map((id) => ({ id, type: "user" as const })),
  ];

  return processFailedJobs(allItems, (item) =>
    anonymizeAccount(item.id, item.type)
  );
}
