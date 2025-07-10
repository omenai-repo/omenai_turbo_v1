import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtistsOnVerifStatus() {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/get_artist_on_verif_status`, {
      method: "GET",
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
