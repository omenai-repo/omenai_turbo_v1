import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";
import { CreateGalleryEventPayload } from "@omenai/shared-lib/zodSchemas/GalleryEventValidationSchema";

export async function createEvent(
  payload: CreateGalleryEventPayload,
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/gallery/events/create`, {
      method: "POST",
      headers: {
        "x-csrf-token": token,
      },
      credentials: "include",
      body: JSON.stringify(payload),
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
