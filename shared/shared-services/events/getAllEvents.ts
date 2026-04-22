import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getAllEvents(
  page: string,
  limit: string,
  filter: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/events/getAllEvents?page=${page}&limit=${limit}&filter=${filter}`,
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      data: result.data,
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
