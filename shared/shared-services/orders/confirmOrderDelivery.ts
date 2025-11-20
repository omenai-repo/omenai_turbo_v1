import {logRollbarServerError} from "@omenai/rollbar-config"
import { getApiUrl } from "@omenai/url-config/src/config";

export const confirmOrderDelivery = async (
  confirm_delivery: boolean,
  order_id: string,
  token: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/confirmOrderDelivery`, {
      method: "POST",
      body: JSON.stringify({
        confirm_delivery,
        order_id,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
