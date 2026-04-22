import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getGalleryArtists(
  gallery_id: string,
  page: number = 1,
  limit: number = 12,
  artistId?: string,
) {
  try {
    const url = getApiUrl();

    const res = await fetch(
      `${url}/api/partners/getGalleryArtists?id=${encodeURIComponent(gallery_id)}&page=${page}&limit=${limit}&artist=${artistId}`,
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
