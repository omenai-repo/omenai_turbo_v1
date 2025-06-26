import { getApiUrl } from "@omenai/url-config/src/config";

export async function createFlwCheckoutSession(
  amount: number,
  customer: { email: string },
  fullname: string,
  tx_ref: string,
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
    tax_fees: number;
  },
  redirect: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/flw/createCheckoutSession`, {
      method: "POST",
      body: JSON.stringify({
        amount,
        customer,
        fullname,
        tx_ref,
        meta,
        redirect,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      url: result.data,
    };
  } catch (error: any) {
    console.log(error);
  }
}
