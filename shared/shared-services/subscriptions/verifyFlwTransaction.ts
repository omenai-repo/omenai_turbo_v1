import { getApiUrl } from "@omenai/url-config/src/config.ts";

export async function verifyFlwTransaction(transaction_id: string) {
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/transactions/verify_FLW_transaction`, {
      method: "POST",
      body: JSON.stringify({ transaction_id }),
    });

    const result = await res.json();

    return {
      isOk: res.ok,
      message: result.message,
      data: result.data,
    };
  } catch (error: any) {
    console.log(error);
  }
}
