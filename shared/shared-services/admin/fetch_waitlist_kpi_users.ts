import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchWaitlistKpiUsers(payload: any, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/fetch_waitlist_kpi_users`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      success: result.isOk,
      users: result.users,
      segments: result.segments,
      pagination: result.pagination,
      facets: result.facets,
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
