import { getApiUrl } from "@omenai/url-config/src/config";

export async function checkIsStripeOnboarded(accountId: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/checkStripeDetailsSubmitted`, {
      method: "POST",
      body: JSON.stringify({ accountId }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      details_submitted: result.details_submitted,
    };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
