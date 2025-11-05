import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";

/*
  step 1 : Validate targetId, if null or undefined, return;
  setp 2 : Loop 3 time and try to delete the records. If it succeed return a response of type DeletionResult
            and if it fails, loop again until MAX_ATTEMPTS === 3
  step 3 : the code will reach step 3 only if all 3 attemps fail and will return;
*/
interface DeletionResult {
  success: boolean;
  deletedCount: number;
  targetId: string;
  attempts: number;
  error?: string;
}

export async function categorizationService(
  targetId: string
): Promise<DeletionResult> {
  const MAX_ATTEMPTS = 3;
  let lastError: Error | undefined;

  // validate targetID
  if (!targetId) {
    const error = "Invalid targetId: must be a non-empty string";
    console.error(error, { received: targetId });
    return {
      success: false,
      deletedCount: 0,
      targetId: targetId || "undefined",
      attempts: 0,
      error,
    };
  }

  // try deletion 3 time
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await ArtistCategorization.deleteOne({
        artist_id: targetId,
      });
      const deletedCount = result.deletedCount || 0;
      console.log(
        `Delete category ${deletedCount > 0 ? "successful" : "completed"}: ${deletedCount} document(s) deleted (attempt ${attempt})`
      );
      return {
        success: true,
        deletedCount,
        targetId,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Delete attempt ${attempt}/${MAX_ATTEMPTS} failed for ${targetId}:`,
        error
      );
    }
  }
  // All 3 attempts failed
  console.error(
    `Failed to delete categorization after ${MAX_ATTEMPTS} attempts for ${targetId}`
  );
  return {
    success: false,
    deletedCount: 0,
    targetId,
    attempts: MAX_ATTEMPTS,
    error: lastError?.message || "Unknown error",
  };
}
