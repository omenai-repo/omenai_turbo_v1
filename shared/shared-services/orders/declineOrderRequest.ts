import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const declineOrderRequest = async (
  data: OrderAcceptedStatusTypes,
  order_id: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/declineOrderRequest`, {
      method: "POST",
      body: JSON.stringify({
        data,
        order_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
};
