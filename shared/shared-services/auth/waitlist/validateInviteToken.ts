import { logRollbarServerError } from "@omenai/rollbar-config";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function validateInviteToken(payload: {
  inviteCode: string;
  email: string;
  entity: string;
  referrerKey: string;
}) {
  try {
    const url = getApiUrl();
    const result = await fetch(`${url}/api/auth/waitlist/validateInviteToken`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const response = await result.json();
    return {
      isOk: result.ok,
      message: response.message,
      status: response.status,
    };
  } catch (error) {
    logRollbarServerError(error);
    return { isOk: false, message: "Something went wrong" };
  }
}
