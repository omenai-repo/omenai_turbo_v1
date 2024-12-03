import { getApiUrl } from "@omenai/url-config/src/config.ts";

export const confirmOrderDelivery = async (
  confirm_delivery: boolean,
  order_id: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/confirmOrderDelivery`, {
      method: "POST",
      body: JSON.stringify({
        confirm_delivery,
        order_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
};
