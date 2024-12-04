import { getApiUrl } from "@omenai/url-config/src/config";

export async function deleteArtwork(art_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/deleteArtwork`, {
      method: "POST",
      body: JSON.stringify({ art_id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
}
