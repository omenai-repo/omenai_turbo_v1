import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function generateStripeLoginLink(account: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/generateStripeLoginLink`, {
      method: "POST",
      body: JSON.stringify({ account }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      url: result.url,
    };
  } catch (error: any) {
    console.log(error);
  }
}
