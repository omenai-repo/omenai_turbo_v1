import { getApiUrl } from "@omenai/url-config/src/config";
import { Filter } from "@omenai/shared-utils/src/isFilterEmpty";
import { rollbarServerInstance } from "@omenai/rollbar-config";

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
