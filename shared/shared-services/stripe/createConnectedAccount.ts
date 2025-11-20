<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createConnectedAccount(
  customer: {
    name: string;
    email: string;
    customer_id: string;
    country: string;
  },
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/createConnectedAccount`, {
      method: "POST",
      body: JSON.stringify({ customer }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      account_id: result.account_id,
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
