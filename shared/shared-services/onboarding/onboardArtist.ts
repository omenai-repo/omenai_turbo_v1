import { rollbarServerInstance } from "@omenai/rollbar-config";
import { ArtistCategorizationUpdateDataTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function onboardArtist(
  payload: ArtistCategorizationUpdateDataTypes
) {
  try {
    const url = getApiUrl();
    const result = await fetch(
      `${url}/api/auth/artist/onboarding/createCategorization`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const response = await result.json();
    return { isOk: result.ok, message: response.message };
  } catch (error) {
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return { isOk: false, message: "Something went wrong" };
  }
}
