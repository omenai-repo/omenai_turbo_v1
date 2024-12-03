import { SubscriptionTokenizationTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config.ts";

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
    console.log(error);
  }
}
