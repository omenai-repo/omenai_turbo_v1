import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchGalleries(page: number, limit: number) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/fetchGalleries?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
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
