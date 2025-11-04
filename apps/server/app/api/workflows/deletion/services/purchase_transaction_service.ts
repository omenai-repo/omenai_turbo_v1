import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

export async function purchaseTransactionService(
  targetId: string,
  metadata: Record<string, any>
) {
  if (metadata.entityType === "artist") {
    await anonymizeArtistTransactions(targetId);
  } else if (metadata.entityType === "gallery") {
    await anonymizeGalleryTransactions(targetId);
  } else {
    await anonymizeUserTransactions(targetId);
  }
}

async function anonymizeArtistTransactions(targetId: string) {
  try {
    const transactions = await PurchaseTransactions.updateMany(
      { trans_recipient_id: { $in: targetId } },
      {
        $set: {
          trans_recipient_id: "deleted_entity",
          trans_recipient_role: "artist",
        },
      }
    );
    const summary = {
      anonymized: transactions.modifiedCount,
      skipped: transactions.matchedCount - transactions.modifiedCount,
      total: transactions.matchedCount,
    };

    console.log(
      `Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
  } catch (error) {
    console.log("Failed anonymization", error);
  }
}

async function anonymizeGalleryTransactions(targetId: string) {
  try {
    const transactions = await PurchaseTransactions.updateMany(
      { trans_recipient_id: { $in: targetId } },
      {
        $set: {
          trans_recipient_id: "deleted_entity",
          trans_recipient_role: "gallery",
        },
      }
    );
    const summary = {
      anonymized: transactions.modifiedCount,
      skipped: transactions.matchedCount - transactions.modifiedCount,
      total: transactions.matchedCount,
    };

    console.log(
      `Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
  } catch (error) {
    console.log("Failed anonymization", error);
  }
}

async function anonymizeUserTransactions(targetId: string) {
  try {
    const transactions = await PurchaseTransactions.updateMany(
      { trans_initiator_id: { $in: targetId } },
      {
        $set: {
          trans_initiator_id: "deleted_entity",
        },
      }
    );
    const summary = {
      anonymized: transactions.modifiedCount,
      skipped: transactions.matchedCount - transactions.modifiedCount,
      total: transactions.matchedCount,
    };

    console.log(
      `Anonymized ${summary.anonymized} transactions, skipped ${summary.skipped}`
    );
  } catch (error) {
    console.log("Failed anonymization", error);
  }
}
