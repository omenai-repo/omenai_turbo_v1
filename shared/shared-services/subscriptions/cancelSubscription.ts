import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function cancelSubscription(gallery_id: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/subscriptions/cancelSubscription`, {
      method: "POST",
      body: JSON.stringify({ gallery_id }),
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
