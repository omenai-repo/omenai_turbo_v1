import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import {
  createFailedTaskJob,
  DeletionReturnType,
  validateTargetId,
} from "../utils";

/**
 * Deletion protocol:
 * 1. Validated targetId : must be defined and nom-empty string
 * 2. Check if the artist_id exist
 * 3. Delete categorization which belong to the following artist_id
 * 4. Create failed job is deletion failed
 */

export async function categorizationService(
  targetId: string
): Promise<DeletionReturnType> {
  const checkIdvalidity = validateTargetId(targetId);

  if (!checkIdvalidity.success) throw new Error("Invalid target ID");

  try {
    const isExist = !!(await ArtistCategorization.exists({
      artist_id: targetId,
    }));
    // Return error if artist_id does not exist
    if (!isExist) {
      return {
        success: true,
        count: { deletedCount: 0 },
        note: "Data non-existent for deletion",
      };
    }

    const result = await ArtistCategorization.deleteOne({
      artist_id: targetId,
    });

    const deletedCount = result.deletedCount;

    if (deletedCount === 0) {
      const result = await createFailedTaskJob({
        error: "Unable to delete artist categorization",
        taskId: targetId,
        payload: { artist_id: targetId },
        jobType: "delete_artist_categorization",
      });
      return {
        success: false,
        count: { deletedCount: 0 },
        note: "Unable to delete categorization data",
        error: "Unable to delete artist categorization",
      };
    } else {
      return {
        success: true,
        count: { deletedCount },
        note: "Deletion protocol successfully executed",
      };
    }
  } catch (error) {
    return {
      success: false,
      note: "An error prevented this deletion protocol from running. Manual intervention in progress",
      count: { deletedCount: 0 },
      error:
        error instanceof Error
          ? error.message
          : `Delete attempt failed for ${targetId}:`,
    };
  }
}
