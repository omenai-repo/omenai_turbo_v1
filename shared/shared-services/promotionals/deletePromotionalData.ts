import { getApiUrl } from "@omenai/url-config/src/config";
import { ObjectId } from "mongoose";

export async function deletePromotionalData(id: ObjectId) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/deletePromotionalData`, {
      method: "POST",
      body: JSON.stringify({ id }),
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
