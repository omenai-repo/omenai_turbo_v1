import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { NextRequest, NextResponse } from "next/server";
import { DHL_API_URL_TEST, getDhlHeaders, getLatLng } from "../resources";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  try {
    const isShipmentTrackingEnabled =
      (await fetchConfigCatValue("shipment_tracking_enabled", "low")) ?? false;
    if (!isShipmentTrackingEnabled) {
      throw new ForbiddenError("Shipment tracking is currently disabled");
    }

    const nextRequest = new NextRequest(request);
    const searchParams = nextRequest.nextUrl.searchParams;

    const id = searchParams.get("order_id");
    if (!id)
      throw new BadRequestError("Invalid parameters - order_id required");

    const filter =
      id.trim().length === 7
        ? { order_id: id.trim() }
        : { "shipping_details.shipment_information.tracking.id": id };

    await connectMongoDB();
    const order = await CreateOrder.findOne(
      { ...filter },
      "shipping_details createdAt artwork_data"
    );

    if (!order)
      throw new NotFoundError("No order found for the given order id");

    const tracking_number =
      order.shipping_details.shipment_information.tracking.id;

    if (!tracking_number)
      throw new NotFoundError(
        "No tracking number found for the given order id"
      );

    // TODO: Fix this

    // const origin_location = `${order.shipping_details.addresses.origin.zip}, ${order.shipping_details.addresses.origin.state}, ${order.shipping_details.addresses.origin.country}`;
    // const destination_location = `${order.shipping_details.addresses.destination.zip}, ${order.shipping_details.addresses.destination.state}, ${order.shipping_details.addresses.destination.country}`;
    // const get_origin_geo_location = await getLatLng(origin_location);
    // await sleep(1100);
    // const get_destination_geo_location = await getLatLng(destination_location);

    // if (!get_origin_geo_location || !get_destination_geo_location)
    //   throw new ServerError("Unable to determine geo location coordinates");

    // TODO: Change this url to the proper production url
    const API_URL = `${DHL_API_URL_TEST}/shipments/9356579890/tracking`;

    const url = new URL(API_URL);
    const requestOptions = {
      method: "GET",
      headers: getDhlHeaders(),
    };

    console.log(requestOptions);

    try {
      const response = await fetch(url.toString(), requestOptions);
      console.log("fetched");
      const data = await response.json();
      console.log(data);

      if (!response.ok)
        throw new ServerError(
          "Unable to fetch shipment event at the moment. Please try again later or contact support"
        );

      const timeStamp = data.shipments[0].shipmentTimeStamp;

      return NextResponse.json(
        {
          message: "Successfully fetched shipment events",
          events: data.shipments[0].events,
          timeStamp,
          cordinates: {},
          order_date: formatISODate(order.createdAt),
          artwork_data: order.artwork_data,
          shipping_details: order.shipping_details,
          tracking_number,
          // coordinates: {
          //   origin: get_origin_geo_location,
          //   destination: get_destination_geo_location,
          // },
        },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
