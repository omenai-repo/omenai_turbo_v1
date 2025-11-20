<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSingleArtworkImpression(id: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(
      `${url}/api/artworks/getSingleArtworkImpression`,
      {
        method: "POST",
        body: JSON.stringify({ id }),
      }
    ).then(async (res) => {
      if (!res.ok) return undefined;
      const result = await res.json();

      return result;
    });

    return response;
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
