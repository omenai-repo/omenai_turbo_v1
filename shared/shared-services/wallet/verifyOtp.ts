import { getApiUrl } from "@omenai/url-config/src/config";

export async function verifyOtp(artist_id: string, otp: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/wallet/pin_recovery/verify_otp_code`, {
      method: "POST",
      body: JSON.stringify({ artist_id, otp }),
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
