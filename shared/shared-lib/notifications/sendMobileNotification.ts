import { NotificationPayload } from "@omenai/shared-types";

export async function pushNotification(
  payload: NotificationPayload
): Promise<{ success: boolean }> {
  const res = await fetch(process.env.EXPO_NOTIFICATION_ENDPOINT!, {
    method: "POST",
    headers: {},
    body: JSON.stringify({
      sound: "default",
      priority: "high",
      ...payload,
    }),
  });

  if (!res.ok) return { success: false };
  return { success: true };
}
