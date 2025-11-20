import { logRollbarServerError } from "@omenai/rollbar-config";
import { TeamMember } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
export async function inviteNewMember(
  email: string,
  access_role: TeamMember["access_role"],
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/invite_new_member`, {
      method: "POST",
      body: JSON.stringify({ email, access_role }),
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
