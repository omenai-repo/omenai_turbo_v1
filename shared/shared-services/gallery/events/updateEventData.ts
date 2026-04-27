import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateEventData(
  galleryId: string,
  eventId: string,
  update_data: any,
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/gallery/events/updateEvent`, {
      method: "PATCH",
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
      body: JSON.stringify({
        gallery_id: galleryId,
        event_id: eventId,
        update_data,
      }),
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
