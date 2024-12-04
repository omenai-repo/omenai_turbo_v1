import { getApiUrl } from "@omenai/url-config/src/config";

export async function checkIsStripeOnboarded(accountId: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/stripe/checkStripeDetailsSubmitted`, {
      method: "POST",
      body: JSON.stringify({ accountId }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      details_submitted: result.details_submitted,
    };
  } catch (error: any) {
    console.log(error);
  }
}
