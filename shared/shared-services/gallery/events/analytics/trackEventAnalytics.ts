import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function trackEventAnalytics(
  eventId: string,
  metric: "views" | "view_in_room" | "shares",
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/events/analytics/trackEventAnalytics`,
      {
        method: "POST",
        body: JSON.stringify({
          event_id: eventId,
          metric,
        }),
      },
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
