require("dotenv").config();

import LogRollbarServerError from "../../shared-lib/rollbar/LogRollbarServerError";
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
    LogRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
