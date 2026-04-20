import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateEventArtwork(
  eventId: string,
  galleryId: string,
  artworkIds: string | string[],
  type: "add" | "remove",
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/gallery/events/update`, {
      method: "PATCH",
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
      body: JSON.stringify({
        event_id: eventId,
        gallery_id: galleryId,
        artwork_id: artworkIds,
        type,
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
