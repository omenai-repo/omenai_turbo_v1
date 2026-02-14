import { logRollbarServerError } from "@omenai/rollbar-config";
import { AddressTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateAddress(
  user_id: string,
  address: AddressTypes,
  token: string
) {
  const url = getApiUrl();

  try {
    const result = await fetch(`${url}/api/update/individual/address`, {
      method: "POST",
      body: JSON.stringify({ user_id, address }),
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
