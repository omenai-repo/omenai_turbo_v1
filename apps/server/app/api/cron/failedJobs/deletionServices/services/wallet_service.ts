import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { processFailedJobs, handleUpdateWithRetry } from "./utils";
import { anonymizeUserId } from "../../../../util";

async function anonymizeWalletData(job: FailedCronJobTypes) {
  const { targetId } = job.payload;

  return handleUpdateWithRetry(job.jobId, () =>
    Wallet.updateOne(
      { owner_id: targetId },
      {
        $set: {
          owner_id: anonymizeUserId(targetId, process.env.ANONYMIZE_SECRET!),
          pending_balance: 0,
          available_balance: 0,
          wallet_pin: null,
          primary_withdrawal_account: null,
          base_currency: "",
        },
      }
    )
  );
}

export async function walletService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) => anonymizeWalletData(job));
}
