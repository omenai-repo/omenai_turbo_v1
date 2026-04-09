import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getFinancialMetrics(year: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/admin/analytics/getFinancialMetrics?year=${year}`,
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
      data: {},
    };
  }
}
