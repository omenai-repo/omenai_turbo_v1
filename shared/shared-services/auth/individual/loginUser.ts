import { getApiUrl } from "@omenai/url-config/src/config";
import LogRollbarServerError from "../../../shared-lib/rollbar/LogRollbarServerError";

export async function loginUser(payload: { email: string; password: string }) {
  try {
    const url = getApiUrl();
    const result = await fetch(`${url}/api/auth/individual/login`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const response = await result.json();
    return {
      isOk: result.ok,
      message: response.message,
      data: response.data,
      signInToken: response.signInToken,
    };
  } catch (error) {
    LogRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
