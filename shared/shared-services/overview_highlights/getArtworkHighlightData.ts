import { getApiUrl } from "@omenai/url-config/src/config";

export async function getArtworkHighlightData(session_id: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/artworks/getAllArtworksbyId`, {
      method: "POST",
      body: JSON.stringify({ id: session_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return { isOk: response.ok, data: result.data, count: result.count };
  } catch (error: any) {
    console.log(error);
  }
}
