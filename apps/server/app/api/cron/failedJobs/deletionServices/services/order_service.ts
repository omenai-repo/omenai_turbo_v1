import { FailedCronJobTypes } from "@omenai/shared-types";
import { handleUpdateWithRetry, processFailedJobs } from "./utils";
import {
  anonymizeUserId,
  anonymizeUsername,
} from "../../../../workflows/deletion/utils";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

export async function orderService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) => {
    const entityType = job.payload.entityType;
    const targetId = job.payload.targetId;
    const targetEntity = entityType === "user" ? "buyer" : "seller";
    const targetAddressMap = entityType === "user" ? "destination" : "origin";
    const targetMap =
      targetEntity === "buyer" ? "buyer_details" : "seller_details";

    const filter = { [`${targetMap}.id`]: targetId };
    const anonymizedTargetID = anonymizeUserId(
      targetId,
      process.env.ANONYMIZE_SECRET!
    );
    const anonymizedUserName = anonymizeUsername(targetId);
    const anonymizedUserFields = {
      id: anonymizedTargetID,
      name: anonymizedUserName,
      email: "",
      address: "",
      phone: "",
    };

    return handleUpdateWithRetry(job.jobId, () =>
      CreateOrder.updateMany(filter, {
        $set: {
          [targetMap]: anonymizedUserFields,
          [`shipping_details.addresses.${targetAddressMap}.address_line`]:
            "REDACTED",
        },
      })
    );
  });
}
