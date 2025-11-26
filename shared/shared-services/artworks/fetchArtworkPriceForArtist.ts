// http://api.omenai.app/api/artworks/getArtworkPriceForArtist?medium=Sculpture (Bronze/stone/metal)&category=Mid-Career&height=86&width=102&currency=NGN
import { logRollbarServerError } from "@omenai/rollbar-config";
import { ArtistCategory, ArtworkMediumTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchArtworkPriceForArtist(
  medium: ArtworkMediumTypes,
  category: ArtistCategory,
  height: string,
  width: string,
  currency: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/artworks/getArtworkPriceForArtist?medium=${medium}&category=${category}&height=${height}&width=${width}&currency=${currency.toUpperCase()}
`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
