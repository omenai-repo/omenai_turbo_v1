import { getApiUrl } from "@omenai/url-config/src/config";

export async function getCurrencyConversion(currency: string, amount: number) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/exchange_rate`, {
      method: "POST",
      body: JSON.stringify({ currency, amount }),
    });

    const result = await res.json();

    return { isOk: res.ok, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
