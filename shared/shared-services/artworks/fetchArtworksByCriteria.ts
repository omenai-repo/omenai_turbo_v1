import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { FilterOptions } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtworksByCriteria(
  page: number,
  filters: FilterOptions,
  medium?: string
) {
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/artworks/getArtworksByCriteria`, {
      method: "POST",
      body: JSON.stringify({ page, medium, filters }),
    });

    const result = await response.json();

    return {
      isOk: response.ok,
      message: result.message,
      data: result.data,
      page: result.page,
      pageCount: result.pageCount,
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
}
