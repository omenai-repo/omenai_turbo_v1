import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { EntityType } from "@omenai/shared-types";
import {
  validateTargetId,
  createFailedTaskJob,
  DeletionReturnType,
} from "../utils";
import { anonymizeUserId, anonymizeUsername } from "../../../util";

export async function orderDeletionServiceProtocol(
  targetId: string,
  entityType: Exclude<EntityType, "admin">
): Promise<DeletionReturnType> {
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
      return {
        success: true,
        note: "User has no order record",
        count: { deletedCount: 0 },
      };

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

    return {
      success: true,
      count: { ...stats },
      note: "Deletion protocol successfully completed",
    };
  } catch (error) {
    let errorMessage = "An unknown error occurred during order deletion.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(
      `Fatal error in orderDeletionProtocol for user ${targetId}:`,
      errorMessage
    );

    return {
      success: false,
      count: { ...stats },
      note: "An error occured during deletion, manual intervention in progress",
      error: errorMessage,
    };
  }
}
