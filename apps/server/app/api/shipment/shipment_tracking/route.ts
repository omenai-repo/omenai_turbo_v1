import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { NextRequest, NextResponse } from "next/server";
import {
  DHL_API,
  DHL_API_URL_PROD,
  DHL_API_URL_TEST,
  getDhlHeaders,
  getLatLng,
} from "../resources";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import z from "zod";
const ShipmentTrackingSchema = z.object({
  id: z.string(),
});
import { ShipmentCoords } from "@omenai/shared-types";
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  try {
    const isShipmentTrackingEnabled =
      (await fetchConfigCatValue("shipment_tracking_enabled", "low")) ?? false;
    if (!isShipmentTrackingEnabled) {
      throw new ForbiddenError("Shipment tracking is currently disabled");
    }

    const nextRequest = new NextRequest(request);
    const searchParams = nextRequest.nextUrl.searchParams;

    const idParams = searchParams.get("order_id");
    const { id } = validateGetRouteParams(ShipmentTrackingSchema, {
      id: idParams,
    });
    if (!id)
      throw new BadRequestError("Invalid parameters - order_id required");

    const filter =
      id.trim().length === 7
        ? { order_id: id.trim() }
        : { "shipping_details.shipment_information.tracking.id": id };

    await connectMongoDB();
    const order = await CreateOrder.findOne(
      { ...filter },
      "shipping_details createdAt artwork_data",
    );

    if (!order)
      throw new NotFoundError("No order found for the given order id");

    const tracking_number =
      order.shipping_details.shipment_information.tracking.id;

    if (!tracking_number)
      throw new NotFoundError(
        "No tracking number found for the given order id",
      );

    const origin_location = `${order.shipping_details.addresses.origin.zip}, ${order.shipping_details.addresses.origin.state}, ${order.shipping_details.addresses.origin.country}`;
    const destination_location = `${order.shipping_details.addresses.destination.zip}, ${order.shipping_details.addresses.destination.state}, ${order.shipping_details.addresses.destination.country}`;
    const get_origin_geo_location = await getLatLng(origin_location);
    await sleep(1200);
    const get_destination_geo_location = await getLatLng(destination_location);

    const API_URL_TEST = `${DHL_API}/shipments/9356579890/tracking?trackingView=all-checkpoints&levelOfDetail=all`;

    const API_URL_PROD = `${DHL_API}/shipments/${tracking_number}/tracking?trackingView=all-checkpoints&levelOfDetail=all`;

    const url = new URL(
      `${process.env.APP_ENV === "production" ? API_URL_PROD : API_URL_TEST}`,
    );
    const requestOptions = {
      method: "GET",
      headers: getDhlHeaders(),
    };

    try {
      const response = await fetch(url.toString(), requestOptions);
      const data = await response.json();

      console.log(process.env.APP_ENV);

      if (!response.ok)
        throw new ServerError(
          "Unable to fetch shipment event at the moment. Please try again later or contact support",
        );

      const timeStamp = data.shipments[0].shipmentTimeStamp;

      return NextResponse.json(
        {
          message: "Successfully fetched shipment events",
          events: data.shipments[0].events,
          timeStamp,
          order_date: formatISODate(order.createdAt),
          artwork_data: order.artwork_data,
          shipping_details: order.shipping_details,
          tracking_number,
          coordinates: {
            origin: get_origin_geo_location,
            destination: get_destination_geo_location,
          } as ShipmentCoords | null,
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "shipment: shipment tracking",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
