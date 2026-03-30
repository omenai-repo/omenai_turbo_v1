import { logRollbarServerError } from "@omenai/rollbar-config";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function requestPrice(
  art_id: string,
  user_id: string,
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/pricing/requestPrice`, {
      method: "POST",
      body: JSON.stringify({ art_id, user_id }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, status: res.status };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
