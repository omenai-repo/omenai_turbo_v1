import { ShippingQuoteTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const updateShippingQuote = async (
  quote_data: ShippingQuoteTypes,
  order_id: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/updateOrderShippingQuote`, {
      method: "POST",
      body: JSON.stringify({
        quote_data,
        order_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
};
