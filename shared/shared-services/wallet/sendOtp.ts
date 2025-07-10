import { getApiUrl } from "@omenai/url-config/src/config";

export async function sendOtp(artist_id: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/wallet/pin_recovery/send_otp_code`, {
      method: "POST",
      body: JSON.stringify({ artist_id }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
    };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
