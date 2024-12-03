import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function createAccountLink(account: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/createAccountLink`, {
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
