import { getApiUrl } from "@omenai/url-config/src/config";

export async function createCheckoutSession(
  item: string,
  amount: number,
  seller_id: string,
  meta: {
    buyer_id: string;
    buyer_email: string;
    seller_email: string;
    seller_name: string;
    seller_id: string;
    artwork_name: string;
    art_id: string;
    shipping_cost: number;
    unit_price: number;
  },
  success_url: string,
  cancel_url: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/createCheckoutSession`, {
      method: "POST",
      body: JSON.stringify({
        item,
        amount,
        seller_id,
        meta,
        cancel_url,
        success_url,
      }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      url: result.url,
    };
  } catch (error: any) {
    console.log(error);
  }
}
