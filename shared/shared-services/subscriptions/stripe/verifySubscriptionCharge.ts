import LogRollbarServerError from "../../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function verifySubscriptionCharge(
  paymentIntentId: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/stripe/verifyStripeSubscriptionCharge`,
      {
        method: "POST",
        body: JSON.stringify({
          paymentIntentId,
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
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
