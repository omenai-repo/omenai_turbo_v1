import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function verifyDiscountedSubscriptionCharge(
  setupIntentId: string,
  planId: string,
  galleryId: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/stripe/verifyDiscountedSubscriptionCharge`,
      {
        method: "POST",
        body: JSON.stringify({
          setupIntentId,
          planId,
          galleryId,
        }),
        headers: { "x-csrf-token": token },
        credentials: "include",
      }
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
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
