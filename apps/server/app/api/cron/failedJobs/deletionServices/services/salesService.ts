import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { processFailedJobs, handleUpdateWithRetry } from "./utils";
import { anonymizeUserId } from "../../../../util";

async function anonymizeSalesActivity(job: FailedCronJobTypes) {
  const targetId = job.payload.id;

  const anonymizedId = anonymizeUserId(targetId, process.env.ANONYMIZE_SECRET!);

  return handleUpdateWithRetry(job.jobId, () =>
    SalesActivity.updateMany({ id: targetId }, { $set: { id: anonymizedId } })
  );
}

export async function salesService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) => anonymizeSalesActivity(job));
}
