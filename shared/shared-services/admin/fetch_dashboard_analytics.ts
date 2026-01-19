import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchDashboardAnalytics() {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/fetch_analytics_data`, {
      method: "GET",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      success: result.success,
      stats: result.stats,
      suggestions: result.suggestions,
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
