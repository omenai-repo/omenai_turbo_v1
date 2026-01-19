import { FailedCronJobTypes } from "@omenai/shared-types";
import { handleDeleteWithRetry, processFailedJobs } from "./utils";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";

export async function notificationService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) =>
    handleDeleteWithRetry(job.payload.targetId, () =>
      NotificationHistory.deleteOne({
        "data.userId": job.payload.targetId,
      })
    )
  );
}
