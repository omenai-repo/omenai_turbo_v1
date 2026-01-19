import { logRollbarServerError } from "@omenai/rollbar-config";
import { MarketingData } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function recordVisit(payload: MarketingData) {
  const url = getApiUrl();

  try {
    const res = await fetch(`${url}/api/analytics/record-visit`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
