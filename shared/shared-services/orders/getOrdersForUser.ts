import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";

import { getApiUrl } from "@omenai/url-config/src/config";

export async function getOrdersForUser() {
  const session = await getServerSession();
  try {
    const url = getApiUrl();
    const res = await fetch(`${url}/api/orders/getOrdersByUserId`, {
      method: "POST",
      body: JSON.stringify({ id: session?.user_id }),
    });

    const result = await res.json();
    return { isOk: res.ok, message: result.message, data: result.data };
  } catch (error: any) {
    console.log(error);
  }
}
