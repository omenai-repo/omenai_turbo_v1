import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";

export async function categorizationService(targetId: string) {
  try {
    await ArtistCategorization.deleteOne({
      artist_id: targetId,
    });
    console.log("Delete category successful");
  } catch (error) {
    console.error("Failed anonymization", error);
    throw error;
  }
}
