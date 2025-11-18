import { rollbarServerInstance } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";
export async function activateAdminAccount(
  token: string,
  name: string,
  email: string,
  password: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/admin/activate_admin_account`, {
      method: "POST",
      body: JSON.stringify({ token, name, email, password }),
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
