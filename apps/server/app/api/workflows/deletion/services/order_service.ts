import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { EntityType } from "@omenai/shared-types";
import {
  validateTargetId,
  anonymizeUserId,
  anonymizeUsername,
  createFailedTaskJob,
} from "../utils";

export async function orderDeletionServiceProtocol(
  targetId: string,
  entityType: Exclude<EntityType, "admin">
) {
  const stats = {
    documentsUpdated: 0,
    documentsLeft: 0,
    documentsProcessed: 0,
  };

  try {
    const checkIdvalidity = validateTargetId(targetId);
    if (!checkIdvalidity.success)
      throw new Error(checkIdvalidity.error ?? "Invalid target ID");

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

    const targetOrderExists = await CreateOrder.exists(filter);
    if (!targetOrderExists)
      return { success: true, message: "User has no order record" };

    const anonymizedUserFields = {
      id: anonymizedTargetID,
      name: anonymizedUserName,
      email: "",
      address: "",
      phone: "",
    };

    const updateResult = await CreateOrder.updateMany(filter, {
      $set: {
        [targetMap]: anonymizedUserFields,
        [`shipping_details.addresses.${targetAddressMap}.address_line`]:
          "REDACTED",
      },
    });

    const { matchedCount, modifiedCount } = updateResult;
    stats.documentsUpdated = modifiedCount;
    stats.documentsLeft = matchedCount - modifiedCount;
    stats.documentsProcessed = matchedCount;

    if (matchedCount > 0 && modifiedCount === 0) {
      await createFailedTaskJob({
        error: "Order anonymization failed for user",
        taskId: `order_service:${targetId}`,
        payload: { targetId, entityType },
        jobType: "anonymize_order_data",
      });
    }

    return { success: true, ...stats };
  } catch (error) {
    let errorMessage = "An unknown error occurred during order deletion.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(
      `Fatal error in orderDeletionProtocol for user ${targetId}:`,
      errorMessage
    );

    return { success: false, ...stats, error: errorMessage };
  }
}
