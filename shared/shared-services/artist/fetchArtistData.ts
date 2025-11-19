import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtistData(id: string, page?: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/artist/fetchFeaturedArtistData?id=${id}&page=${page}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      artworks: result.artist_artworks,
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
