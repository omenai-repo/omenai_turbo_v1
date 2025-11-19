import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtistProfile(id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/artist/fetchProfile?id=${id}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      artist: result.artist,
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
