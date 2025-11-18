import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createViewHistory(
  artwork: string,
  artist: string,
  art_id: string,
  user_id: string,
  url: string,
  token: string
) {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/viewHistory/createViewHistory`, {
      method: "POST",

      body: JSON.stringify({ artwork, artist, art_id, user_id, url }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    return { isOk: res.ok };
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
