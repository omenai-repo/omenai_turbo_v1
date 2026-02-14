import { logRollbarServerError } from "@omenai/rollbar-config";
import { SubscriptionMetaData } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createSubscriptionPaymentIntent(
  amount: number,
  gallery_id: string,
  meta: SubscriptionMetaData,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/stripe/createSubscriptionPaymentIntent`,
      {
        method: "POST",
        body: JSON.stringify({
          amount,
          gallery_id,
          meta,
        }),
        headers: { "x-csrf-token": token },
        credentials: "include",
      }
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      client_secret: result.paymentIntent,
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
