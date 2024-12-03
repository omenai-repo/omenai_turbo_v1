import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function getAllPlanData() {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/subscriptions/retrievePlans`, {
      method: "GET",
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      data: result.data,
    };
  } catch (error: any) {
    console.log(error);
  }
}
