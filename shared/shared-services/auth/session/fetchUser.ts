import { logRollbarServerError } from "@omenai/rollbar-config";
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchUser(payload: {
  id: string;
  route: RouteIdentifier;
  token: string;
}) {
  try {
    const url = getApiUrl();
    const result = await fetch(
      `${url}/api/auth/profile/${payload.route}?id=${payload.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": payload.token,
        },
        credentials: "include",
      },
    );
    const response = await result.json();
    return {
      isOk: result.ok,
      artist: response.artist,
    };
  } catch (error) {
    logRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
