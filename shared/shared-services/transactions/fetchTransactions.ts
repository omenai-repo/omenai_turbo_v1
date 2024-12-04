import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchTransactions(gallery_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/transactions/fetchTransaction`, {
      method: "POST",
      body: JSON.stringify({ gallery_id }),
    });

    const result = await res.json();

    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
