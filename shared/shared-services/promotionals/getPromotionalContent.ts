import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function getPromotionalData() {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/promotionals/getPromotionalData`, {
      method: "GET",
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
