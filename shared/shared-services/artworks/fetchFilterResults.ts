import { getApiUrl } from "@omenai/url-config/src/config";
import { Filter } from "@omenai/shared-utils/src/isFilterEmpty";
<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a

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
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
