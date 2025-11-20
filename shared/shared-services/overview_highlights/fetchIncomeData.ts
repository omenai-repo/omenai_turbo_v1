import {logRollbarServerError} from "@omenai/rollbar-config"
import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchIncomeData(
  session_id: string,
  route: RouteIdentifier
) {
  try {
    const url = getApiUrl();
    const response = await fetch(
      `${url}/api/requests/${route}/fetchIncomeData?id=${session_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    return { isOk: response.ok, data: result.data };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
