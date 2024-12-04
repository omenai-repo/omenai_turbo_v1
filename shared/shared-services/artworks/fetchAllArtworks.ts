import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchAllArtworks(page: number) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getAllArtworks`, {
      method: "POST",

      body: JSON.stringify({ page }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
