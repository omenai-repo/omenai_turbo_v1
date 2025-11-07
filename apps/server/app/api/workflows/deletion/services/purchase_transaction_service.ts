import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { createFailedTaskJob } from "../utils";

interface AnonymizationSummary {
  anonymized: number;
  skipped: number;
  total: number;
  successfulJobCreations: boolean;
}

export async function purchaseTransactionService(
  targetId: string,
  metadata: Record<string, any>
) {
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
  const MAX_EXECUTION_TIME = 55000;
  const startTime = Date.now();
  try {
    const BATCH_SIZE = 50;
    let totalModified = 0;
    let totalMatched = 0;

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
        console.log("No more documents to process");
        break;
      }
      batchNumber++;

      const ids = batch.map((doc) => doc._id);

      const result = await PurchaseTransactions.updateMany(
        { _id: { $in: ids } },
        { $set: { [field]: "deleted_entity" } }
      );

      totalMatched += result.matchedCount;
      totalModified += result.modifiedCount;

      console.log(`Batch processed, ${totalModified} total so far`);

      if (batch.length === 0) break;
    }
    let failedJobCreations = false;

    if (totalMatched - totalModified > 0) {
      failedJobCreations = await createFailedTaskJob({
        error: "Unable to anonymize transaction",
        taskId: targetId,
        payload: { [field]: targetId },
        jobType: "anonymize_transaction",
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
    console.error("Failed anonymization", error);
  }
}
