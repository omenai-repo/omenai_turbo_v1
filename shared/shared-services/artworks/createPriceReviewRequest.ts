import { logRollbarServerError } from "@omenai/rollbar-config";
import { ArtworkPriceFilterData } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createPriceReviewRequest(data: any, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/createPriceReviewRequest`, {
      method: "POST",
      body: JSON.stringify({ ...data }),
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      status: result.status,
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
