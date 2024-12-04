import { getApiUrl } from "@omenai/url-config/src/config";

export async function cancelSubscription(gallery_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/subscriptions/cancelSubscription`, {
      method: "POST",
      body: JSON.stringify({ gallery_id }),
    });

    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
}
