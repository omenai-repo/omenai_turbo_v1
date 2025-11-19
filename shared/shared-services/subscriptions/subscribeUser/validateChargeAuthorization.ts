import logRollbarServerError from "../../../shared-lib/rollbar/logRollbarServerError";
import {
  FLWDirectChargeDataTypes,
  PinAuthorizationData,
  AvsAuthorizationData,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function validateChargeAuthorization(
  data: FLWDirectChargeDataTypes & {
    authorization: PinAuthorizationData | AvsAuthorizationData;
  },
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/subscribeUser/validateChargeAuthorization`,
      {
        method: "POST",
        body: JSON.stringify({ ...data }),
        headers: { "x-csrf-token": token },
        credentials: "include",
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
