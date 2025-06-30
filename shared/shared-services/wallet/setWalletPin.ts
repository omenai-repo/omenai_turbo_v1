import { getApiUrl } from "@omenai/url-config/src/config";

export async function setWalletPin(wallet_id: string, pin: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/wallet/update_wallet_pin`, {
      method: "POST",
      body: JSON.stringify({ wallet_id, pin }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
