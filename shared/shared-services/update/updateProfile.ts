import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import {
  RouteIdentifier,
  GalleryProfileUpdateData,
  IndividualProfileUpdateData,
  ArtistProfileUpdateData,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateProfile(
  route: RouteIdentifier,
  payload:
    | GalleryProfileUpdateData
    | IndividualProfileUpdateData
    | ArtistProfileUpdateData,
  id: string,
  token: string
) {
  const url = getApiUrl();

  const result = await fetch(`${url}/api/update/${route}/profile`, {
    method: "POST",
    body: JSON.stringify({ ...payload, id }),
    headers: {
      "Content-type": "application/json",
      "x-csrf-token": token,
    },
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
        body: {
          message:
            "An error was encountered, please try again later or contact support",
        },
      };
    });

  return result;
}
