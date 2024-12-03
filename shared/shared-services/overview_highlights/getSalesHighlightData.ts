import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function getSalesHighlightData(session_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/sales/getAllSalesById`, {
      method: "POST",
      body: JSON.stringify({ id: session_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return undefined;
    const result = await res.json();

    return result;
  } catch (error: any) {
    console.log(error);
  }
}
