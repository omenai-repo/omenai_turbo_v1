import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtistsData(query: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/fetchArtists?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "x-csrf-token": token,
        },
        credentials: "include",
      },
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message, results: result.results };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
