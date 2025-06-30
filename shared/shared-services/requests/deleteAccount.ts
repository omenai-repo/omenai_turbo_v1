import { RouteIdentifier } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function deleteAccount(
  route: RouteIdentifier,
  session_id: string,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/requests/${route}/deleteAccount`, {
      method: "POST",
      body: JSON.stringify({ id: session_id }),
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
