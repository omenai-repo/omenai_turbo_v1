<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import {logRollbarServerError} from "@omenai/rollbar-config"
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { AddressTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateAddress(
  artist_id: string,
  address: AddressTypes,
  base_currency: string,
  token: string
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
