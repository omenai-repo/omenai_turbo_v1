import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { processFailedJobs, handleUpdateWithRetry } from "./utils";
import { anonymizeUsername } from "../../../../util";

async function anonymizeSubscription(job: FailedCronJobTypes) {
  const { targetId } = job.payload;

  return handleUpdateWithRetry(job.jobId, () =>
    Subscriptions.updateOne(
      { "customer.gallery_id": targetId },
      {
        $set: {
          "customer.name": anonymizeUsername(targetId),
          "customer.phone_number": null,
          "customer.email": null,
          paymentMethod: null,
        },
      }
    )
  );
}

export async function subscriptionService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) => anonymizeSubscription(job));
}
