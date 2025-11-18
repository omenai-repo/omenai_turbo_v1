import { rollbarServerInstance } from "@omenai/rollbar-config";
import { FLWDirectChargeDataTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function initiateDirectCharge(
  data: FLWDirectChargeDataTypes,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/subscribeUser/initiateDirectCharge`,
      {
        method: "POST",
        body: JSON.stringify({ ...data }),
        headers: { "x-csrf-token": token },
        credentials: "include",
      }
    );

    const result = await res.json();
    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
