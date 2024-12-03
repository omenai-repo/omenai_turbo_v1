import { NextChargeParams } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function updateSubscriptionPlan(
  data: NextChargeParams,
  gallery_id: string,
  action: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/subscriptions/updateSubscriptionPlan`, {
      method: "POST",
      body: JSON.stringify({ data, gallery_id, action }),
    });

    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
