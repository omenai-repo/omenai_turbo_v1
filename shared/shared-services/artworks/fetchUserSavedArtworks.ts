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
      body: JSON.stringify({ id: user_id as string, page, filters }),
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
    console.log(error);
  }
}
