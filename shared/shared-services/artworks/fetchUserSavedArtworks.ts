import { rollbarServerInstance } from "@omenai/rollbar-config";
import { FilterOptions } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchUserSaveArtworks(
  page: number,
  user_id: string,
  filters?: FilterOptions
) {
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/artworks/getUserSavedArtworks`, {
      method: "POST",
      body: JSON.stringify({ id: user_id, page, filters }),
    });

    const result = await response.json();
    return {
      isOk: response.ok,
      data: result.data,
      count: result.pageCount,
      total: result.total,
      message: result.message,
    };
  } catch (error: any) {
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
