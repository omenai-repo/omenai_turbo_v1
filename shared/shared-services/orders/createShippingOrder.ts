import { logRollbarServerError } from "@omenai/rollbar-config";
import { AddressTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const createShippingOrder = async (
  buyer_id: string,
  art_id: string,
  seller_id: string,
  save_shipping_address: boolean,
  shipping_address: AddressTypes,
  origin_address: AddressTypes | null,
  designation: "gallery" | "artist",
  token: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/createOrder`, {
      method: "POST",
      body: JSON.stringify({
        buyer_id,
        art_id,
        seller_id,
        save_shipping_address,
        shipping_address,
        origin_address,
        designation,
      }),
      headers: { "x-csrf-token": token },
      credentials: "include",
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "An error was encountered, please try again later or contact support",
    };
  }
};
