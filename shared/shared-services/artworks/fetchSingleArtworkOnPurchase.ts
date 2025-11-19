import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSingleArtworkOnPurchase(art_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getSingleArtworkOnPurchase`, {
      method: "POST",
      body: JSON.stringify({ art_id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
