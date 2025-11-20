import {logRollbarServerError} from "@omenai/rollbar-config"
import { getApiUrl } from "@omenai/url-config/src/config";
import { ObjectId } from "mongoose";

export async function deletePromotionalData(id: ObjectId, token: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/deletePromotionalData`, {
      method: "POST",
      body: JSON.stringify({ id }),
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
