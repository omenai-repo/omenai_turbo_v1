import { getApiUrl } from "@omenai/url-config/src/config";
import {
  filterOptionsType,
  IndividualSchemaTypes,
} from "@omenai/shared-types/index";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
export const fetchCuratedArtworks = async (
  page: number,
  filters?: filterOptionsType
) => {
  const session = await getServerSession();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getUserCuratedArtworks`, {
      method: "POST",
      body: JSON.stringify({
        preferences: (session as IndividualSchemaTypes).preferences,
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
    console.log(error);
  }
};
