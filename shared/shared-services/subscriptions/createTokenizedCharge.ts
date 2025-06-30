import { SubscriptionTokenizationTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createTokenizedCharge(
  data: SubscriptionTokenizationTypes
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/subscriptions/createTokenizedCharge`, {
      method: "POST",
      body: JSON.stringify({ ...data }),
    });

    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
