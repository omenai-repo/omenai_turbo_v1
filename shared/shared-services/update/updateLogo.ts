import {logRollbarServerError} from "@omenai/rollbar-config"
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateLogo(
  payload: {
    id: string;
    url: string;
    route: "gallery" | "artist";
  },
  token: string
) {
  const url = getApiUrl();

  const result = await fetch(`${url}/api/requests/${payload.route}/logo`, {
    method: "POST",
    body: JSON.stringify({ ...payload }),
    headers: { "x-csrf-token": token },
    credentials: "include",
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
        message:
          "An error was encountered, please try again later or contact support",
      };
    });

  return result;
}
