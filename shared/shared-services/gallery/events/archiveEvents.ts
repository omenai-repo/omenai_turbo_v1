import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function archiveEvent(
  galleryId: string,
  eventId: string,
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/gallery/events/archive`, {
      method: "POST",
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
      body: JSON.stringify({ gallery_id: galleryId, event_id: eventId }),
    });

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
