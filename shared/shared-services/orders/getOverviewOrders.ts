"use server";
import { getSession } from "@omenai/shared-auth/lib/auth/session";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function getOverviewOrders() {
  const session = await getSession();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/orders/getOrdersByGalleryId`, {
      method: "POST",
      body: JSON.stringify({
        id: session?.gallery_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
