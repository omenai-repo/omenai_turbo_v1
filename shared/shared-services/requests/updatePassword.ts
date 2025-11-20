import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updatePassword(
  password: string,
  code: string,
  route: RouteIdentifier,
  session_id: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/${route}/updatePassword`, {
      method: "POST",
      body: JSON.stringify({ id: session_id, password, code }),
      headers: { "x-csrf-token": token },
      credentials: "include",
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
