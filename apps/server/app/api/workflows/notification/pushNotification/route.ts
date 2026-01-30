import { NotificationPayload } from "@omenai/shared-types";
import { serve } from "@upstash/workflow/nextjs";
import { getMongoClient } from "../../shipment/utils";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { getApiUrl } from "@omenai/url-config/src/config";
import { pushNotification } from "@omenai/shared-lib/notifications/sendMobileNotification";

/**
 * Calls the notification creation API with a timeout.
 * Throws a ServerError on failure.
 */
async function callCreateNotificationApi(data: any): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${getApiUrl()}/api/notifications/createNotification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    // Parse response ONCE
    const result = await response.json();

    if (!response.ok) {
      throw new ServerError(
        result?.message || "Unable to create notification record",
      );
    }

    return result;
  } catch (error: any) {
    clearTimeout(timeout);
    // Provide more error context
    if (error.name === "AbortError") {
      throw new ServerError("Notification API request timed out");
    }
    throw new ServerError(
      `Failed to create notification: ${error?.message || error}`,
    );
  }
}

export const { POST } = serve<NotificationPayload>(async (ctx) => {
  const payload = ctx.requestPayload;

  return await ctx.run("push_notification", async () => {
    await getMongoClient();
    const { title, body, data } = payload;
    const notification_payload = { title, body, data };

    try {
      // Run both actions in parallel for efficiency
      const [createNotificationHistory, sendNotification] = await Promise.all([
        callCreateNotificationApi(notification_payload),
        pushNotification(payload),
      ]);

      // Check both succeeded
      if (!createNotificationHistory || sendNotification?.success !== true) {
        throw new ServerError(
          `Notification failed: history=${!!createNotificationHistory}, send=${sendNotification?.success}`,
        );
      }

      return true;
    } catch (error) {
      // Log the actual error for debugging
      console.error("Notification workflow error:", error);
      // Throw for Upstash to handle as a failed workflow
      throw error;
    }
  });
});
