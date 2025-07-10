import { PromotionalSchemaTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function createPromotionalData(
  data: PromotionalSchemaTypes,
  token: string
) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/createPromotional`, {
      method: "POST",
      body: JSON.stringify(data),
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
