import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSingleArtworkImpression(id: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(
      `${url}/api/artworks/getSingleArtworkImpression`,
      {
        method: "POST",
        body: JSON.stringify({ id }),
      }
    ).then(async (res) => {
      if (!res.ok) return undefined;
      const result = await res.json();

      return result;
    });

    return response;
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
