import {
  FLWDirectChargeDataTypes,
  PinAuthorizationData,
  AvsAuthorizationData,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function validateChargeAuthorization(
  data: FLWDirectChargeDataTypes & {
    authorization: PinAuthorizationData | AvsAuthorizationData;
  }
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/subscribeUser/validateChargeAuthorization`,
      {
        method: "POST",
        body: JSON.stringify({ ...data }),
      }
    );

    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}