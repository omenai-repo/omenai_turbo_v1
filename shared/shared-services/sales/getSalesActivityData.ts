import { getApiUrl } from "@omenai/url-config/src/config";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";

export async function getSalesActivityData(id: string, year: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/sales/getActivityById`, {
      method: "POST",
      body: JSON.stringify({ id, year }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
}
