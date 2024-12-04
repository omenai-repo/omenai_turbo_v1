import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtworksByCriteria(
  medium: string,
  page?: number,
  filters?: any
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
    };
  } catch (error: any) {
    console.log(error);
  }
}
