import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import {
  anonymizeUserId,
  createFailedTaskJob,
  validateTargetId,
} from "../utils";

interface AnonymizationSummary {
  anonymized: number;
  skipped: number;
  total: number;
  successfulJobCreations: boolean;
}

export async function salesServiceDeletionProtocol(targetId: string) {
  const checkIdvalidity = validateTargetId(targetId);
  if (!checkIdvalidity.success) return checkIdvalidity;

  const MAX_EXECUTION_TIME = 55000;
  const startTime = Date.now();
  try {
    const BATCH_SIZE = 50;
    let totalModified = 0;
    let totalMatched = 0;
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

      totalMatched += result.matchedCount;
      totalModified += result.modifiedCount;

      console.log(`Batch processed, ${totalModified} total so far`);
    }
    let failedJobCreations = false;

    if (totalMatched - totalModified > 0) {
      failedJobCreations = await createFailedTaskJob({
        error: "Unable to anonymize Sales",
        taskId: targetId,
        payload: { id: targetId },
        jobType: "anonymize_sales_activity",
      });
    }

    const summary: AnonymizationSummary = {
      anonymized: totalModified,
      skipped: totalMatched - totalModified,
      total: totalMatched,
      successfulJobCreations: failedJobCreations,
    };

    console.log(
      `Completed: Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
    return summary;
  } catch (error) {
    console.error("saleService anonymization failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
