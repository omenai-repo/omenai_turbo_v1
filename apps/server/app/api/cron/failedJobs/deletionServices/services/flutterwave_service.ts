import { FailedCronJobTypes } from "@omenai/shared-types";
import { handleDeleteWithRetry, processFailedJobs } from "./utils";
import { deleteFlutterwaveBeneficiary } from "../../../../workflows/deletion/services/wallet_service";

export async function flutterwaveService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) =>
    handleDeleteWithRetry(job.payload.beneficiary_id, () =>
      deleteFlutterwaveBeneficiary(job.payload.beneficiary_id)
    )
  );
}
