import {
  HoldStatus,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";

export const acceptOrderRequest = async (
  order_id: string,
  dimensions: ShipmentDimensions,
  exhibition_status: OrderArtworkExhibitionStatus | null,
  hold_status: HoldStatus | null,
  specialInstructions?: string
) => {
  const url = getApiUrl();
  try {
    const res = await fetch(`${url}/api/orders/accept_order_request`, {
      method: "POST",
      body: JSON.stringify({
        order_id,
        dimensions,
        exhibition_status,
        hold_status,
        specialInstructions,
      }),
    });
    const result = await res.json();
    return { isOk: res.ok, message: result.message };
  } catch (error: any) {
    console.log(error);
  }
};
