import { getApiUrl } from "@omenai/url-config/src/config";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { GallerySchemaTypes } from "@omenai/shared-types";

export async function getOverviewOrders() {
  const session = await getServerSession();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/orders/getOrdersBySellerId`, {
      method: "POST",
      body: JSON.stringify({
        id: (session as GallerySchemaTypes).gallery_id,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
