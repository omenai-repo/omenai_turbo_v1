import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { createFailedTaskJob } from "../utils";

interface AnonymizationSummary {
  anonymized: number;
  skipped: number;
  total: number;
  successfulJobCreations: number;
  failedJobCreations: number;
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

    const failedTask: Promise<boolean>[] = [];

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
        .lean();

      if (batch.length === 0) {
        console.log("No more documents to process");
        break;
      }

      const ids = batch.map((doc) => doc._id);

      const results = await Promise.allSettled(
        ids.map(
          async (id) =>
            await PurchaseTransactions.updateOne(
              { _id: id },
              { $set: { [field]: "deleted_entity" } }
            )
        )
      );
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          totalMatched += result.value.matchedCount;
          totalModified += result.value.modifiedCount;

          if (result.value.modifiedCount === 0) {
            failedTask.push(
              createFailedTaskJob({
                error: "Unable to anonymize transaction",
                taskId: ids[index] as string,
                payload: { [field]: targetId },
                jobType: "anonymize_transaction",
              })
            );
          }
        } else {
          failedTask.push(
            createFailedTaskJob({
              error: "Unable to anonymize transaction",
              taskId: ids[index] as string,
              payload: { [field]: targetId },
              jobType: "anonymize_transaction",
            })
          );
        }
      });

      console.log(`Batch processed, ${totalModified} total so far`);

      if (batch.length === 0) break;
    }

    let successfulJobCreations = 0;
    let failedJobCreations = 0;

    const results = await Promise.allSettled(failedTask);
    for (const result of results) {
      if (result.status === "fulfilled") successfulJobCreations++;
      else failedJobCreations++;
    }

    const summary: AnonymizationSummary = {
      anonymized: totalModified,
      skipped: totalMatched - totalModified,
      total: totalMatched,
      successfulJobCreations,
      failedJobCreations,
    };

    console.log(
      `Completed: Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
    return summary;
  } catch (error) {
    console.error("Failed anonymization", error);
  }
}
