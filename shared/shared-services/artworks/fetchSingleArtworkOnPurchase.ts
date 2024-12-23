import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSingleArtworkOnPurchase(title: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getSingleArtworkOnPurchase`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
