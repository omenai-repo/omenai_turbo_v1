import { getApiUrl } from "@omenai/url-config/src/config";
import { Filter } from "@omenai/shared-utils/src/isFilterEmpty";

export async function fetchFilterResults(filters: Filter) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/filterArtworks`, {
      method: "POST",
      body: JSON.stringify({ ...filters }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
