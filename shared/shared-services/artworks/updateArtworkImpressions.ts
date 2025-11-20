<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import { logRollbarServerError } from "@omenai/rollbar-config";
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateArtworkImpressions(
  id: string,
  value: boolean,
  like_id: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const response = await fetch(
      `${url}/api/artworks/updateArtworkImpressions`,
      {
        method: "POST",
        body: JSON.stringify({ id, value, like_id }),
        headers: { "x-csrf-token": token },
        credentials: "include",
      }
    ).then(async (res) => {
      const response: { isOk: boolean; body: { message: string; data: any } } =
        {
          isOk: res.ok,
          body: await res.json(),
        };

      return response;
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
