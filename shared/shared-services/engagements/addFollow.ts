import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function addFollow(
  payload: {
    followerId: string;
    followingId: string;
    followingType: "artist" | "gallery";
  },
  token: string,
) {
  const url = getApiUrl();
  try {
    const response = await fetch(`${url}/api/engagements/follow`, {
      method: "POST",
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return { isOk: response.ok, message: result.message };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
