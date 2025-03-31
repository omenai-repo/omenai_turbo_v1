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
  }).then(async (res) => {
    const response = {
      isOk: res.ok,
      body: await res.json(),
    };

    return response;
  });

  return result;
}
