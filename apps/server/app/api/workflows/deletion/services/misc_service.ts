import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import {
  createFailedTaskJob,
  DeletionReturnType,
  validateTargetId,
} from "../utils";
import { NotificationHistory } from "@omenai/shared-models/models/notifications/NotificationHistorySchema";

export async function miscServiceDeletionProtocol(
  targetId: string
): Promise<DeletionReturnType> {
  const stats = {
    tokenDeleted: false,
    notificationsDeleted: 0,
  };
  try {
    const checkIdvalidity = validateTargetId(targetId);
    if (!checkIdvalidity.success)
      throw new Error(checkIdvalidity.error ?? "Invalid target ID");

    // 1. Check for existence first (like you do for notifications)
    const deviceExists = !!(await DeviceManagement.exists({
      auth_id: targetId,
    }));

    if (deviceExists) {
      const deleteDeviceToken = await DeviceManagement.deleteOne({
        auth_id: targetId,
      });

      if (!deleteDeviceToken.acknowledged) {
        await createFailedTaskJob({
          payload: { targetId },
          taskId: `${targetId}:deviceToken`,
          jobType: "delete_device_token",
          error: "Device token deletion not acknowledged by DB",
        });
      } else {
        // 3. Only set to true on success
        stats.tokenDeleted = deleteDeviceToken.deletedCount > 0;
      }
    } else {
      // 4. If no device exists, mark as "true" because there's nothing to delete
      stats.tokenDeleted = true;
    }

    const notificationExists = !!(await NotificationHistory.exists({
      "data.userId": targetId,
    }));

    if (!notificationExists) {
      return {
        success: true,
        count: { ...stats },
        note: "No notification records to delete",
      };
    }

    const deleteNotifications = await NotificationHistory.deleteMany({
      "data.userId": targetId,
    });

    if (!deleteNotifications.acknowledged) {
      const createFailedTask = await createFailedTaskJob({
        payload: { targetId },
        taskId: `${targetId}:notifications`,
        jobType: "delete_notification_history",
        error: "Notification History not deleted",
      });

      if (!createFailedTask) {
        // NOTE: Create logger to inform dev team of failure
      }
    }

    stats.notificationsDeleted = deleteNotifications.deletedCount;

    return {
      success: true,
      count: { ...stats },
      note: "All records successfully deleted",
    };
  } catch (error) {
    console.error(
      `Unable to execute misc deletion protocol for user: ${targetId}`,
      (error as Error).message
    );

    return {
      success: false,
      count: { ...stats },
      error: (error as Error).message,
      note: "An error occured during deletion, manual intervention in progress",
    };
  }
}
