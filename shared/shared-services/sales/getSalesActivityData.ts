import { getApiUrl } from "@omenai/url-config/src/config.js";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear.js";

export async function getSalesActivityData(id: string) {
  const { year } = getCurrentMonthAndYear();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/sales/getActivityById`, {
      method: "POST",
      body: JSON.stringify({ id, year }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
