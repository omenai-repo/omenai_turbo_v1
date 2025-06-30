import { getApiUrl } from "@omenai/url-config/src/config";

export async function fetchSubscriptionTransactions(gallery_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/transactions/fetchSubTrans`, {
      method: "POST",
      body: JSON.stringify({ gallery_id: gallery_id }),
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
