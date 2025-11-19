import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { getApiUrl } from "@omenai/url-config/src/config";

export const getSingleOrder = async (order_id: string) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/getSingleOrder`, {
      method: "POST",
      body: JSON.stringify({
        order_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
