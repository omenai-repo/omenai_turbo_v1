import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchEvents(galleryId: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/events/fetch?gallery_id=${galleryId}`,
      {
        method: "GET",
        headers: {
          "x-csrf-token": token,
        },
        credentials: "include",
      },
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      activeEvents: result.activeEvents,
      pastEvents: result.pastEvents,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
