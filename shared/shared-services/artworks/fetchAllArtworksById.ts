import { getApiUrl } from "@omenai/url-config/src/config";
export async function getAllArtworksById(session_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/artworks/getAllArtworksbyId`, {
      method: "POST",
      body: JSON.stringify({ id: session_id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
