import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchPriceReviewRequests(
  id: string,
  page: string,
  limit: string,
  status: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/admin/fetchPriceReviewRequests?id=${id}&page=${page}&limit=${limit}&status=${status}`,
    );

    const result = await res.json();
    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      meta: result.meta,
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
