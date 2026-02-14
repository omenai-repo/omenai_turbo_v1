import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { createFailedTaskJob, DeletionReturnType } from "../utils";

interface AnonymizationSummary {
  anonymized: number;
  skipped: number;
  total: number;
  successfulJobCreations: boolean;
}

export async function purchaseTransactionService(
  targetId: string,
  metadata: Record<string, any>
): Promise<DeletionReturnType> {
  let summary;
  if (metadata.entityType === "user") {
    summary = await anonymizeTransactions(targetId, "trans_initiator_id");
  } else {
    summary = await anonymizeTransactions(targetId, "trans_recipient_id");
  }
  return summary;
}
async function anonymizeTransactions(
  targetId: string,
  field: "trans_recipient_id" | "trans_initiator_id"
) {
  const stats = {
    totalModified: 0,
    totalMatched: 0,
  };
  const MAX_EXECUTION_TIME = 55000;
  const startTime = Date.now();
  try {
    const BATCH_SIZE = 50;

    let batchNumber = 0;

    while (true) {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime > MAX_EXECUTION_TIME) {
        console.warn(
          `Stopping batch processing: approaching execution time limit (${elapsedTime}ms elapsed)`
        );
        break;
      }

      const batch = await PurchaseTransactions.find({
        [field]: targetId,
      })
        .limit(BATCH_SIZE)
        .skip(BATCH_SIZE * batchNumber)
        .lean();

      if (batch.length === 0) {
        break;
      }
      batchNumber++;

      const ids = batch.map((doc) => doc._id);

      const result = await PurchaseTransactions.updateMany(
        { _id: { $in: ids } },
        { $set: { [field]: "deleted_entity" } }
      );

      stats.totalMatched += result.matchedCount;
      stats.totalModified += result.modifiedCount;

      if (batch.length === 0) break;
    }
    let failedJobCreations = false;

    if (stats.totalMatched - stats.totalModified > 0) {
      failedJobCreations = await createFailedTaskJob({
        error: "Unable to anonymize transaction",
        taskId: targetId,
        payload: { [field]: targetId },
        jobType: "anonymize_transaction",
      });
    }

    const summary: AnonymizationSummary = {
      anonymized: stats.totalModified,
      skipped: stats.totalMatched - stats.totalModified,
      total: stats.totalMatched,
      successfulJobCreations: failedJobCreations,
    };

    return {
      success: true,
      count: { ...summary },
      note: "Deletion protocol successfully executed",
    };
  } catch (error) {
    return {
      success: false,
      count: { ...stats },
      note: "An error occured during deletion, manual intervention in progress",
      error: "Unknown error",
    };
  }
}
