import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function uploadArtworkData(
  data: Omit<ArtworkSchemaTypes, "art_id" | "availability">
) {
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/artworks/upload`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
      },
    }).then(async (res) => {
      const response = {
        isOk: res.ok,
        body: await res.json(),
      };

      return response;
    });

    return response;
  } catch (error: any) {
    console.log(error);
  }
}
