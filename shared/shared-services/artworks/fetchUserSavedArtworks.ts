"use server";
import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchUserSaveArtworks() {
  const session = await getSession();
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/artworks/getUserSavedArtworks`, {
      method: "POST",
      body: JSON.stringify({ id: session?.user_id as string }),
    }).then(async (res) => {
      if (!res.ok) return undefined;
      const result = await res.json();

      return result;
    });

    return response;
  } catch (error: any) {
    console.log(error);
  }
}
