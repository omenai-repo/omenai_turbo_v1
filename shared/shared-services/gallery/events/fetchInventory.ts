import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchInventory(
  galleryId: string,
  page: number,
  limit: string,
  searchTerm: string,
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/requests/gallery/events/fetchInventory?gallery_id=${galleryId}&page=${page}&limit=${limit}&search_term=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers: {
          "x-csrf-token": token,
        },
        credentials: "include",
      },
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      results: result.data,
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
