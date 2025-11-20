<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import { toast } from "sonner";

export async function resendCode(
  route: RouteIdentifier,
  payload: { author: string }
) {
  try {
    const url = getApiUrl();

    const res = await fetch(`${url}/api/requests/${route}/verify/resend`, {
      method: "POST",
      body: JSON.stringify({ author: payload.author }),
    });
    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
