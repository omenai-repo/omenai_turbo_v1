import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function fetchTrendingArtworks(page: number, filters?: any) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getTrendingArtworks`, {
      method: "POST",
      body: JSON.stringify({ page, filters }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      page: result.page,
      count: result.pageCount,
      total: result.total,
    };
  } catch (error: any) {
    console.log(error);
  }
}
