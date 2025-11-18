import { rollbarServerInstance } from "@omenai/rollbar-config";
import { TeamMember } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
export async function editMemberRole(
  admin_id: string,
  role: TeamMember["access_role"],
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/edit_member_role`, {
      method: "PUT",
      body: JSON.stringify({ admin_id, role }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
