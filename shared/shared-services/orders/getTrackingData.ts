import { getApiUrl } from "@omenai/url-config/src/config";

export const getTrackingData = async (order_id: string) => {
  const url = getApiUrl();
  try {
    const res = await fetch(
      `${url}/api/shipment/shipment_tracking?order_id=${order_id}`,
      {
        method: "GET",
      }
    );
    const result = await res.json();
    return {
      isOk: res.ok,
      message: result.message,
      events: result.events,
      coordinates: result.coordinates,
    };
  } catch (error: any) {
    console.log(error);
  }
};
