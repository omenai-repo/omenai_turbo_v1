<<<<<<< HEAD
import { logRollbarServerError } from "@omenai/shared-lib/rollbar/logRollbarServerError";
=======
import { logRollbarServerError } from "@omenai/rollbar-config";
>>>>>>> 803a2d78989b652a590ef0824e74ca9f52adca1a
import { getApiUrl } from "@omenai/url-config/src/config";

export async function checkAdminActivation(id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(
      `${url}/api/admin/check_admin_activation?id=${id}`,
      {
        method: "GET",
      }
    );

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.isActive };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
