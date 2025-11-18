import { rollbarServerInstance } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createSubscriptionPaymentIntent(
  amount: number,
  gallery_id: string,
  meta: {
    name: string;
    email: string;
    gallery_id: string;
    plan_id: string;
    plan_interval: string;
  },
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
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
