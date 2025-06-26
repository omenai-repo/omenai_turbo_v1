import { getApiUrl } from "@omenai/url-config/src/config";

export async function createConnectedAccount(
  customer: {
    name: string;
    email: string;
    customer_id: string;
    country: string;
  },
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/createConnectedAccount`, {
      method: "POST",
      body: JSON.stringify({ customer }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      account_id: result.account_id,
    };
  } catch (error: any) {
    console.log(error);
  }
}
