"use server";
import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchPopularArtworks() {
  const session = await getSession();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getPopularArtworks`, {
      method: "POST",
      body: JSON.stringify({ id: session?.gallery_id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
