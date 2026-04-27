import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateInstallationViews(
  galleryId: string,
  eventId: string,
  image_urls: string | string[],
  type: "add" | "remove",
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/events/updateInstallationViews`,
      {
        method: "PATCH",
        headers: {
          "x-csrf-token": token,
        },
        credentials: "include",
        body: JSON.stringify({
          gallery_id: galleryId,
          event_id: eventId,
          image_urls,
          type,
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
