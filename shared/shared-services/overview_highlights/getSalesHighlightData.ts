import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getSalesHighlightData(session_id: string) {
  try {
    const url = getApiUrl();
    const response = await fetch(`${url}/api/sales/getAllSalesById`, {
      method: "POST",
      body: JSON.stringify({ id: session_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return { isOk: response.ok, data: result.data, count: result.count };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
