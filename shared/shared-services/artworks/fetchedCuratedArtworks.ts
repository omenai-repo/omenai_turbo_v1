import { getApiUrl } from "@omenai/url-config/src/config";
import { filterOptionsType } from "@omenai/shared-types/index";
import { rollbarServerInstance } from "@omenai/rollbar-config";
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
};
