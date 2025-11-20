<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function resetPassword(
  route: RouteIdentifier,
  payload: { password: string; id: string }
) {
  const url = getApiUrl();

  const result = await fetch(`${url}/api/requests/${route}/resetPassword`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then(async (res) => {
      const data: { message: string } = await res.json();
      const response = {
        isOk: res.ok,
        body: { message: data.message },
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
