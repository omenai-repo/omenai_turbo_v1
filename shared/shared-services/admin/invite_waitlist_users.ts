import { logRollbarServerError } from "@omenai/rollbar-config";
import { WaitListTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
export async function inviteWaitlistUsers(
  waitlistUsers: { waitlistId: string; discount: boolean }[],
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/invite_waitlist_users`, {
      method: "POST",
      body: JSON.stringify({ waitlistUsers }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
