import { PromotionalSchemaTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createPromotionalData(data: PromotionalSchemaTypes) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/createPromotional`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
}
