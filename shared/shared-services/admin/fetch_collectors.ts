import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchCollectors(
  page: string | number,
  limit: string | number,
  token: string,
) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/admin/fetch_collectors?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: { "x-csrf-token": token },
        credentials: "include",
      },
    );

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
      total: result.total,
      pages: result.pages,
      page: result.page,
      limit: result.limit,
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
