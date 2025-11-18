import { rollbarServerInstance } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function loginAdmin(payload: { email: string; password: string }) {
  try {
    const url = getApiUrl();
    const result = await fetch(`${url}/api/auth/admin/login`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const response = await result.json();
    return { isOk: result.ok, message: response.message, data: response.data };
  } catch (error) {
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
    return { isOk: false, message: "Something went wrong" };
  }
}
