import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtistVerificationInfo(id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/admin/fetch_artist_verif_info?id=${id}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
