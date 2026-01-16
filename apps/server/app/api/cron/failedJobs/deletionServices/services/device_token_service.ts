import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { handleDeleteWithRetry, processFailedJobs } from "./utils";

export async function deviceTokenService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) =>
    handleDeleteWithRetry(job.payload.targetId, () =>
      DeviceManagement.deleteOne({
        auth_id: job.payload.targetId,
      })
    )
  );
}
