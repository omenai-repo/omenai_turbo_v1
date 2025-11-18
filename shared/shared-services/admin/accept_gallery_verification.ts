import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";
export async function acceptGalleryVerification(
  gallery_id: string,
  name: string,
  email: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/accept_gallery_verification`, {
      method: "POST",
      body: JSON.stringify({ gallery_id, name, email }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
