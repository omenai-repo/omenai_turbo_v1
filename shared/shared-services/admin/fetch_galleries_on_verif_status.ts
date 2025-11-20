require("dotenv").config();

import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchGalleriesOnVerifStatus() {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/get_galleries_on_verif_status`, {
      method: "GET",
    });

    const result = await res.json();
    console.log(result);

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
