import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function retrieveBalance(account: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/retrieveBalance`, {
      method: "POST",
      body: JSON.stringify({ account }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      data: result.data,
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
