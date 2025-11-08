import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import {
  anonymizeUserId,
  createFailedTaskJob,
  DeletionReturnType,
  validateTargetId,
} from "../utils";

interface AnonymizationSummary {
  anonymized: number;
  skipped: number;
  total: number;
  successfulJobCreations: boolean;
}

export async function salesServiceDeletionProtocol(
  targetId: string
): Promise<DeletionReturnType> {
  const stats = {
    totalModified: 0,
    totalMatched: 0,
  };
  const checkIdvalidity = validateTargetId(targetId);
  if (!checkIdvalidity.success)
    throw new Error(checkIdvalidity.error ?? "Invalid target ID");

  const MAX_EXECUTION_TIME = 55000;
  const startTime = Date.now();
  try {
    const BATCH_SIZE = 50;

    let batchNumber = 0;

    const anonymizedId = anonymizeUserId(
      targetId,
      process.env.ANONYMIZE_SECRET!
    );

    while (true) {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime > MAX_EXECUTION_TIME) {
        console.warn(
          `Stopping batch processing: approaching execution time limit (${elapsedTime}ms elapsed)`
        );
        break;
      }

      const batch = await SalesActivity.find({
        id: targetId,
      })
        .limit(BATCH_SIZE)
        .skip(BATCH_SIZE * batchNumber)
        .lean();

      if (batch.length === 0) {
        console.log("No more documents to process");
        break;
      }
      batchNumber++;

      const ids = batch.map((doc) => doc._id);

      const result = await SalesActivity.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            id: anonymizedId,
          },
        }
      );

      stats.totalMatched += result.matchedCount;
      stats.totalModified += result.modifiedCount;

      console.log(`Batch processed, ${stats.totalModified} total so far`);
    }
    let failedJobCreations = false;

    if (stats.totalMatched - stats.totalModified > 0) {
      failedJobCreations = await createFailedTaskJob({
        error: "Unable to anonymize Sales",
        taskId: targetId,
        payload: { id: targetId },
        jobType: "anonymize_sales_activity",
      });
    }

    const summary: AnonymizationSummary = {
      anonymized: stats.totalModified,
      skipped: stats.totalMatched - stats.totalModified,
      total: stats.totalMatched,
      successfulJobCreations: failedJobCreations,
    };

    console.log(
      `Completed: Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
    return {
      success: true,
      count: { ...summary },
      note: "Deletion protocol successfully executed",
    };
  } catch (error) {
    console.error("saleService anonymization failed", error);
    return {
      success: false,
      count: { ...stats },
      note: "An error occured during deletion, manual intervention in progress",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
