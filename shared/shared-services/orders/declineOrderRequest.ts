import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const declineOrderRequest = async (
  data: OrderAcceptedStatusTypes,
  order_id: string,
  token: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/declineOrderRequest`, {
      method: "POST",
      body: JSON.stringify({
        data,
        order_id,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
