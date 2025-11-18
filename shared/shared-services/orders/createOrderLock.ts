import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export const createOrderLock = async (
  art_id: string,
  user_id: string,
  token: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/locks/createLock`, {
      method: "POST",
      body: JSON.stringify({
        art_id,
        user_id,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
