import LogRollbarServerError from "../../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function signOut() {
  try {
    const url = getApiUrl();
    const result = await fetch(`${url}/api/auth/session/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const response = await result.json();
    return { isOk: result.ok, message: response.message };
  } catch (error) {
    LogRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
