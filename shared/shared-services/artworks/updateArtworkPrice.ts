import { ArtworkPriceFilterData } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateArtworkPrice(
  filter: ArtworkPriceFilterData,
  art_id: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/updateArtworkPrice`, {
      method: "POST",
      body: JSON.stringify({ filter, art_id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
}
