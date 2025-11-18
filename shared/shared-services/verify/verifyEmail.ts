import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function verifyEmail(
  payload: { params: string; token: string },
  route: RouteIdentifier
) {
  const url = getApiUrl();

  const result = await fetch(`${url}/api/requests/${route}/verifyMail`, {
    method: "POST",
    body: JSON.stringify({ params: payload.params, token: payload.token }),
  })
    .then(async (res) => {
      const response = {
        isOk: res.ok,
        body: await res.json(),
      };

      return response;
    })
    .catch((error) => {
      LogRollbarServerError(error);
      return {
        isOk: false,
        body: {
          message:
            "An error was encountered, please try again later or contact support",
        },
      };
    });

  return result;
}
