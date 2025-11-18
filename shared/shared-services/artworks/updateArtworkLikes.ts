import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export const updateArtworkLikes = async (
  id: string,
  like_id: string,
  value: boolean,
  token: string
) => {
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
      const response: { isOk: boolean } = {
        isOk: res.ok,
      };

      return response;
    });

    return response;
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
