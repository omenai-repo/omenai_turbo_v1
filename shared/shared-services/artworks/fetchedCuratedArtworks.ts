import { getApiUrl } from "@omenai/url-config/src/config";
import { filterOptionsType } from "@omenai/shared-types/index";
<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
export const fetchCuratedArtworks = async (
  page: number,
  preferences: string[],
  filters?: filterOptionsType
) => {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getUserCuratedArtworks`, {
      method: "POST",
      body: JSON.stringify({
        preferences,
        page,
        filters,
      }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      count: result.pageCount,
      total: result.total,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
