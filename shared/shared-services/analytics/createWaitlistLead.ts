import { logRollbarServerError } from "@omenai/rollbar-config";
import { IWaitlistLead } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

type Payload = Omit<
  IWaitlistLead,
  "hasConvertedToPaid" | "createdAt" | "device"
>;

export async function createWaitlistLead(payload: Payload) {
  const url = getApiUrl();

  try {
    const res = await fetch(`${url}/api/analytics/waitlist-lead`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
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
