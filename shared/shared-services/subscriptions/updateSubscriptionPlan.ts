import { NextChargeParams } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function updateSubscriptionPlan(
  data: NextChargeParams,
  gallery_id: string,
  action: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/subscriptions/updateSubscriptionPlan`, {
      method: "POST",
      body: JSON.stringify({ data, gallery_id, action }),
      headers: { "x-csrf-token": token },
      credentials: "include",
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
