import { getApiUrl } from "@omenai/url-config/src/config";
import { getSession } from "next-auth/react";

export async function getOverviewOrders(session_id: string) {
  const session = await getSession();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/orders/getOrdersByGalleryId`, {
      method: "POST",
      body: JSON.stringify({
        id: session_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
