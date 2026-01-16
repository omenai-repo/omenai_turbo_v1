import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { DeletePromise } from "@omenai/shared-types";

type DeleteOperation<T> = (item: T) => Promise<{
  success: boolean;
  jobId: string;
  error?: string;
}>;

/**
 * Reusable utility to process failed jobs with retry logic
 * @param items - Array of items to process
 * @param deleteOperation - Function that performs the delete operation
 * @returns Promise with success status
 */
export async function processFailedJobs<T>(
  items: T[],
  deleteOperation: DeleteOperation<T>
) {
  try {
    const deletePromises: DeletePromise[] = items.map((item) =>
      deleteOperation(item)
    );

    const results = await Promise.allSettled(deletePromises);
    const successfulJobIds: string[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.success) {
        successfulJobIds.push(result.value.jobId);
      }
    });

    if (successfulJobIds.length > 0) {
      await FailedJob.deleteMany({
        jobId: { $in: successfulJobIds },
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// In jobUtils.ts
export async function handleUpdateWithRetry(
  jobId: string,
  updateCallback: () => Promise<{ modifiedCount: number }>
) {
  try {
    const result = await updateCallback();

    if (result.modifiedCount === 0) {
      await FailedJob.updateOne({ jobId }, { $inc: { retryCount: 1 } });
      return { success: false, jobId };
    }

    return { success: true, jobId };
  } catch (error) {
    return {
      success: false,
      jobId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper to handle delete operation with retry count increment
 */
export async function handleDeleteWithRetry(
  jobId: string,
  deleteCallback: () => Promise<{ deletedCount: number }>
) {
  try {
    const result = await deleteCallback();

    if (result.deletedCount === 0) {
      await FailedJob.updateOne({ jobId }, { $inc: { retryCount: 1 } });
      return { success: false, jobId };
    }

    return { success: true, jobId };
  } catch (error) {
    return {
      success: false,
      jobId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
