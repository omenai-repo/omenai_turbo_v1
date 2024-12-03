import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function createViewHistory(
  artwork: string,
  artist: string,
  art_id: string,
  user_id: string,
  url: string
) {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/viewHistory/createViewHistory`, {
      method: "POST",

      body: JSON.stringify({ artwork, artist, art_id, user_id, url }),
    });

    return { isOk: res.ok };
  } catch (error: any) {
    console.log(error);
  }
}
