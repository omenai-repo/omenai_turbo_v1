import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { processFailedJobs, handleUpdateWithRetry } from "./utils";

async function anonymizeTransaction(job: FailedCronJobTypes) {
  const field = job.payload.trans_initiator_id
    ? "trans_initiator_id"
    : "trans_recipient_id";
  const targetId = job.payload[field];

  return handleUpdateWithRetry(job.jobId, () =>
    PurchaseTransactions.updateMany(
      { [field]: targetId },
      { $set: { [field]: "deleted_entity" } }
    )
  );
}

export async function transactionService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) => anonymizeTransaction(job));
}
