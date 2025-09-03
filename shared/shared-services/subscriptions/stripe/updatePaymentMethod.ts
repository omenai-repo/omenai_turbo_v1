import { getApiUrl } from "@omenai/url-config/src/config";

export async function updatePaymentMethod(
  setupIntentId: string,
  gallery_id: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/stripe/updatePaymentMethod`,
      {
        method: "PUT",
        body: JSON.stringify({
          setupIntentId,
          gallery_id,
        }),
        headers: { "x-csrf-token": token },
        credentials: "include",
      }
    );

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
