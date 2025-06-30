import { FLWDirectChargeDataTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function initiateDirectCharge(data: FLWDirectChargeDataTypes) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/subscribeUser/initiateDirectCharge`,
      {
        method: "POST",
        body: JSON.stringify({ ...data }),
      }
    );

    const result = await res.json();
    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
