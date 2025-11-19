import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getSinglePlanData(plan_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/subscriptions/retrieveSinglePlan?plan_id=${plan_id}`
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      data: result.data,
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
