import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function createCheckoutSession(
  item: string,
  amount: number,
  gallery_id: string,
  meta: {
    trans_type: string;
    user_id: string;
    user_email: string;
    gallery_email: string;
    gallery_name: string;
    artwork_name: string;
    art_id: string;
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
        gallery_id,
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
