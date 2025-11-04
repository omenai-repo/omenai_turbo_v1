import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

export async function purchaseTransactionService(
  targetId: string,
  metadata: Record<string, any>
) {
  let summary;
  if (metadata.entityType === "user") {
    summary = await anonymizeUserTransactions(targetId);
  } else {
    summary = await anonymizeTransactions(targetId, metadata.entityType);
  }
  return summary;
}

async function anonymizeTransactions(targetId: string, entityType: string) {
  try {
    const BATCH_SIZE = 1000;
    let totalModified = 0;
    let totalMatched = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await PurchaseTransactions.find({
        trans_recipient_id: targetId,
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
            trans_recipient_id: "deleted_entity",
            trans_recipient_role: entityType.toLowerCase(),
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

    const summary = {
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

async function anonymizeUserTransactions(targetId: string) {
  try {
    const BATCH_SIZE = 1000;
    let totalModified = 0;
    let totalMatched = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await PurchaseTransactions.find({
        trans_initiator_id: targetId,
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
            trans_initiator_id: "deleted_entity",
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

    const summary = {
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
