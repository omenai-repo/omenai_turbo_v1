import { getApiUrl } from "@omenai/url-config/src/config";
import { logRollbarServerError } from "@omenai/rollbar-config";

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
    logRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
