import logRollbarServerError from "../../shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getTransferRate(
  source: string,
  destination: string,
  amount: number
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/flw/getTransferRate?source=${source}&destination=${destination}&amount=${amount}`,
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
