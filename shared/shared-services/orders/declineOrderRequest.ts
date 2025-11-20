import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const declineOrderRequest = async (
  data: OrderAcceptedStatusTypes,
  order_id: string,
  seller_designation: "artist" | "gallery",
  art_id: string,
  token: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/declineOrderRequest`, {
      method: "POST",
      body: JSON.stringify({
        data,
        order_id,
        seller_designation,
        art_id,
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
