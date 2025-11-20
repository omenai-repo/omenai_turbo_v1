import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function blockGallery(gallery_id: string, status: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/block_gallery`, {
      method: "POST",
      body: JSON.stringify({ gallery_id, status }),
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
