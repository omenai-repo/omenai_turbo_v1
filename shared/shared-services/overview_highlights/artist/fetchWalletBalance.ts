import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchWalletBalance(session_id: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(
      `${url}/api/wallet/fetch_wallet_balance?id=${session_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    return { isOk: response.ok, data: result.balances };
  } catch (error: any) {
    console.log(error);
  }
}
