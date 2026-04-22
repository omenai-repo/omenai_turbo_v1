import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateArtworkSequence(
  eventId: string,
  galleryId: string,
  newSequence: string[],
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/events/updateArtworkSequence`,
      {
        method: "PATCH",
        headers: {
          "x-csrf-token": token,
        },
        credentials: "include",
        body: JSON.stringify({
          galleryId,
          eventId,
          newSequence,
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
