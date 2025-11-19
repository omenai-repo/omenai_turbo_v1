import logRollbarServerError from "../../shared-lib/rollbar/logRollbarServerError";
import { PromotionalDataUpdateTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import { ObjectId } from "mongoose";

export async function updatePromotionalData(
  id: ObjectId,
  data: PromotionalDataUpdateTypes,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/updatePromotionalData`, {
      method: "POST",
      body: JSON.stringify({ id, updates: data }),
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
