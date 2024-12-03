import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function fetchSimilarArtworksByArtist(artist: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/artworks/getArtworksByArtist`, {
      method: "POST",
      body: JSON.stringify({ artist }),
    });

    const result = await response.json();

    return {
      isOk: response.ok,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.log(error);
  }
}
