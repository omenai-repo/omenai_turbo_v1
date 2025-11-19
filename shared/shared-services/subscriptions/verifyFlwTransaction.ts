import logRollbarServerError from "../../shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function verifyFlwTransaction(
  transaction_id: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/transactions/verify_FLW_transaction`, {
      method: "POST",
      body: JSON.stringify({ transaction_id }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
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
