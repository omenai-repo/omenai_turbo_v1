import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getGalleryWorks(queryParams: URLSearchParams) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/events/getGalleryWorks?${queryParams.toString()}`,
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
