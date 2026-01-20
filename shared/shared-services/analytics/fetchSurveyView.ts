import { logRollbarServerError } from "@omenai/rollbar-config";
import { MarketingData } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSurveyView(
  country: string,
  page: number,
  limit: number = 20,
) {
  const url = getApiUrl();

  try {
    const res = await fetch(`${url}/api/analytics/survey-stats`, {
      method: "POST",
      body: JSON.stringify({ country, page, limit }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      success: result.success,
      stats: result.stats,
      pagination: result.pagination,
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
