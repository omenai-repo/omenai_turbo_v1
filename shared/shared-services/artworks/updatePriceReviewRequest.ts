import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updatePriceReviewRequest(
  artist_id: string,
  review_id: string,
  action: "ACCEPT" | "DECLINE",
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/updatePriceReviewRequest`, {
      method: "PATCH",
      body: JSON.stringify({ artist_id, review_id, action }),
      headers: { "x-csrf-token": token },
      credentials: "include",
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
