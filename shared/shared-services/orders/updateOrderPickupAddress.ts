import { logRollbarServerError } from "@omenai/rollbar-config";
import { AddressTypes, OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const updatePickupAddress = async ({
  type,
  pickupAddress,
  order_id,
  token,
}: {
  type: "pickup" | "delivery";
  pickupAddress: AddressTypes;
  order_id: string;
  token: string;
}) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/updateOrderPickupAddress`, {
      method: "PATCH",
      body: JSON.stringify({
        order_id,
        type,
        pickupAddress,
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
