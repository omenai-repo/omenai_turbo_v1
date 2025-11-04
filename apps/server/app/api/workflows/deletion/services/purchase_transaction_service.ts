import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

interface AnonymizationSummary {
  anonymized: number;
  skipped: number;
  total: number;
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
  try {
    const BATCH_SIZE = 1000;
    let totalModified = 0;
    let totalMatched = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await PurchaseTransactions.find({
        [field]: targetId,
      })
        .limit(BATCH_SIZE)
        .lean();

      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      const ids = batch.map((doc) => doc._id);
      const result = await PurchaseTransactions.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            [field]: "deleted_entity",
          },
        }
      );

      totalModified += result.modifiedCount;
      totalMatched += result.matchedCount;

      console.log(
        `Batch processed: ${result.modifiedCount} modified, ${totalModified} total so far`
      );

      if (batch.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    const summary: AnonymizationSummary = {
      anonymized: totalModified,
      skipped: totalMatched - totalModified,
      total: totalMatched,
    };

    console.log(
      `Completed: Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
    return summary;
  } catch (error) {
    console.error("Failed anonymization", error);
    throw error;
  }
}
