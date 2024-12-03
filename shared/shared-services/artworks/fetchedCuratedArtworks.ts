import { getApiUrl } from "@omenai/url-config/src/config.ts";
import { filterOptionsType } from "@omenai/shared-types/index.ts";
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
      pageCount: result.pageCount,
    };
  } catch (error: any) {
    console.log(error);
  }
};
