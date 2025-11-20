import {logRollbarServerError} from "@omenai/rollbar-config"
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchTransactions(
  trans_recipient_id: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/transactions/fetchTransaction`, {
      method: "POST",
      body: JSON.stringify({ trans_recipient_id }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
