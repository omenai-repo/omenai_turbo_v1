import {logRollbarServerError} from "@omenai/rollbar-config"
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getBanks(countryCode: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/wallet/accounts/get_banks?countryCode=${countryCode}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.banks };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
