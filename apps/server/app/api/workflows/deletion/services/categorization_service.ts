import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { createFailedTaskJob, validateTargetId } from "../utils";

/**
 * Deletion protocol:
 * 1. Validated targetId : must be defined and nom-empty string
 * 2. Check if the artist_id exist
 * 3. Delete categorization which belong to the following artist_id
 * 4. Create failed job is deletion failed
 */

export async function categorizationService(targetId: string) {
  const checkIdvalidity = validateTargetId(targetId);

  if (!checkIdvalidity.success) return checkIdvalidity;

  try {
    const isExist = !!(await ArtistCategorization.exists({
      artist_id: targetId,
    }));
    // Return error if artist_id does not exist
    if (!isExist) {
      const error =
        "Invalid targetId: targetId does not exist in ArtistCategorization";
      console.error(error, { received: targetId });
      return {
        success: false,
        error,
      };
    }

    const result = await ArtistCategorization.deleteOne({
      artist_id: targetId,
    });

    const deletedCount = result.deletedCount;

    if (deletedCount === 0) {
      const result = await createFailedTaskJob({
        error: "Unable to delete artist categorization to Cloudinary",
        taskId: targetId,
        payload: { artist_id: targetId },
        jobType: "delete_artist_categorization",
      });
      return {
        success: false,
        error: "Unable to delete artist categorization to Cloudinary",
        failedTaskCreated: result,
      };
    } else {
      console.log(`Delete category successful`);
      return {
        success: true,
        deletedCount,
        targetId,
      };
    }
  } catch (error) {
    console.error(`Delete attempt failed for ${targetId}:`, error);
  }
}
