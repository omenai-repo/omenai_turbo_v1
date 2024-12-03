import { PromotionalDataUpdateTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config.ts";
import { ObjectId } from "mongoose";

export async function updatePromotionalData(
  id: ObjectId,
  data: PromotionalDataUpdateTypes
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/updatePromotionalData`, {
      method: "POST",
      body: JSON.stringify({ id, updates: data }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
}
