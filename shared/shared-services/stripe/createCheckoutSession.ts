import { logRollbarServerError } from "@omenai/rollbar-config";
import { MetaSchema } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createStripeCheckoutSession(
  item: string,
  amount: number,
  seller_id: string,
  meta: MetaSchema,
  success_url: string,
  cancel_url: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/createCheckoutSession`, {
      method: "POST",
      body: JSON.stringify({
        item,
        amount,
        seller_id,
        meta,
        cancel_url,
        success_url,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      url: result.url,
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
