import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchFollows(sessionId: string) {
  const url = getApiUrl();
  try {
    const response = await fetch(
      `${url}/api/engagements/fetchFollows?id=${sessionId}`,
    );

    const result = await response.json();

    return {
      isOk: response.ok,
      message: result.message,
      followedIds: result.followedIds,
    };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
