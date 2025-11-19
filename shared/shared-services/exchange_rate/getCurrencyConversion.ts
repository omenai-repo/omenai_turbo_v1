import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getCurrencyConversion(
  currency: string,
  amount: number,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/exchange_rate`, {
      method: "POST",
      body: JSON.stringify({ currency, amount }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, data: result.data };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
