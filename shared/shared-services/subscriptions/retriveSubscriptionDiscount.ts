import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function retrieveSubscriptionDiscount(
  email: string,
  token: string
) {
  try {
    const url = getApiUrl();

    const res = await fetch(`${url}/api/subscriptions/retrieveDiscountStatus`, {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      discount: result.discount,
    };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
