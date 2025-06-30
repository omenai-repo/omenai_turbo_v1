import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchPopularArtworks(id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getPopularArtworks`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
