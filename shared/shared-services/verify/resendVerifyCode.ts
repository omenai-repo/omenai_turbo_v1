import { rollbarServerInstance } from "@omenai/rollbar-config";
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
