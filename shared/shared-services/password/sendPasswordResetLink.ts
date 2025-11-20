import {logRollbarServerError} from "@omenai/rollbar-config"
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function sendPasswordResetLink(
  route: RouteIdentifier,
  payload: { email: string },
  token: string
) {
  const url = getApiUrl();

  const result = await fetch(
    `${url}/api/requests/${route}/sendPasswordResetLink`,
    {
      method: "POST",
      body: JSON.stringify({ recoveryEmail: payload.email }),
      headers: {
        "Content-type": "application/json",
      },
    }
  )
    .then(async (res) => {
      const data: { message: string; id: string } = await res.json();
      const response = {
        isOk: res.ok,
        body: { message: data.message, id: data.id },
      };

      return response;
    })
    .catch((error) => {
      logRollbarServerError(error);
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
