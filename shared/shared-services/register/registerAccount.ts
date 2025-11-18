import { rollbarServerInstance } from "@omenai/rollbar-config";
import {
  IndividualRegisterData,
  GalleryRegisterData,
  ArtistRegisterData,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function registerAccount(
  payload: IndividualRegisterData | GalleryRegisterData | ArtistRegisterData,
  route: "gallery" | "individual" | "artist"
) {
  const url = getApiUrl();
  const result = await fetch(`${url}/api/auth/${route}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then(async (res) => {
      const response = {
        isOk: res.ok,
        body: await res.json(),
      };

      return response;
    })
    .catch((error) => {
      if (error instanceof Error) {
        rollbarServerInstance.error(error);
      } else {
        // Wrap non-Error objects in an Error
        rollbarServerInstance.error(new Error(String(error)));
      }
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
