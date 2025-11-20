<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
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
    logRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
