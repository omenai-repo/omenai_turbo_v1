import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchRoster(galleryId: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/roster?gallery_id=${galleryId}`,
      {
        method: "GET",
        headers: {
          "x-csrf-token": token,
        },
        credentials: "include",
      },
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message, roster: result.roster };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
