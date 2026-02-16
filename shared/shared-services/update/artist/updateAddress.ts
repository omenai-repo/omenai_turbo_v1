import { logRollbarServerError } from "@omenai/rollbar-config";
import { AddressTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateAddress(
  artist_id: string,
  address: AddressTypes,
  base_currency: string,
  token: string,
) {
  const url = getApiUrl();

  try {
    const result = await fetch(`${url}/api/update/artist/address`, {
      method: "POST",
      body: JSON.stringify({ artist_id, address, base_currency }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const response = await result.json();

    return { isOk: result.ok, message: response.message };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
