import { getApiUrl } from "@omenai/url-config/src/config";
export async function resendAdminInvite(admin_id: string, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/resend_admin_invite`, {
      method: "POST",
      body: JSON.stringify({ admin_id }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
