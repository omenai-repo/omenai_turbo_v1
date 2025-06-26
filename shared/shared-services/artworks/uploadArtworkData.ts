import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function uploadArtworkData(
  data: Omit<ArtworkSchemaTypes, "art_id" | "availability">,
  token: string
) {
  try {
    const url = getApiUrl();

    const response = await fetch(`${url}/api/artworks/upload`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
        "x-csrf-token": token,
      },
      credentials: "include",
    });

    const result = await response.json();

    return { body: result, isOk: response.ok };
  } catch (error: any) {
    console.log(error);
  }
}
