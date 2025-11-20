import { logRollbarServerError } from "@omenai/rollbar-config";
import { ArtistCategory } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
export async function acceptArtistVerification(
  artist_id: string,
  recommendation: ArtistCategory,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/accept_artist_verification`, {
      method: "POST",
      body: JSON.stringify({ artist_id, recommendation }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
