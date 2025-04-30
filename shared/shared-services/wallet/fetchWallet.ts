import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchWallet(id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/wallet/fetch_wallet?id=${id}`, {
      method: "GET",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.wallet };
  } catch (error: any) {
    console.log(error);
  }
}
