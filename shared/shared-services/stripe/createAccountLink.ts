import { getApiUrl } from "@omenai/url-config/src/config";

export async function createAccountLink(account: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/createAccountLink`, {
      method: "POST",
      body: JSON.stringify({ account }),
      headers: { "x-csrf-token": token },
      credentials: "include",
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
