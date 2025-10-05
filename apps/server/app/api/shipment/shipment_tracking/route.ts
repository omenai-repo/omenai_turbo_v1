import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { NextRequest, NextResponse } from "next/server";
import { getLatLng, HEADERS, TRACKING_HEADER } from "../resources";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const nextRequest = new NextRequest(request);
  const searchParams = nextRequest.nextUrl.searchParams;

  const id = searchParams.get("order_id");
  if (!id) throw new BadRequestError("Invalid parameters - order_id required");

  const filter =
    id.trim().length === 7
      ? { order_id: id.trim() }
      : { "shipping_details.shipment_information.tracking.id": id };

  await connectMongoDB();
  const order = await CreateOrder.findOne(
    { ...filter },
    "shipping_details createdAt artwork_data"
  );

  if (!order) throw new NotFoundError("No order found for the given order id");

  const tracking_number =
    order.shipping_details.shipment_information.tracking.id;

  if (!tracking_number)
    throw new NotFoundError("No tracking number found for the given order id");

  // const origin_location = `${order.shipping_details.addresses.origin.zip}, ${order.shipping_details.addresses.origin.state}, ${order.shipping_details.addresses.origin.country}`;
  // const destination_location = `${order.shipping_details.addresses.destination.zip}, ${order.shipping_details.addresses.destination.state}, ${order.shipping_details.addresses.destination.country}`;
  // const get_origin_geo_location = await getLatLng(origin_location);
  // await sleep(1100);
  // const get_destination_geo_location = await getLatLng(destination_location);

  // if (!get_origin_geo_location || !get_destination_geo_location)
  //   throw new ServerError("Unable to determine geo location coordinates");

  // TODO: Change this url to the proper production url
  const API_URL = `https://api-mock.dhl.com/mydhlapi/shipments/5786694760/tracking?trackingView=all&levelOfDetail=all-checkpoints&requestControlledAccessDataCodes=false&requestGMTOffsetPerEvent=false`;

  const url = new URL(API_URL);
  const requestOptions = {
    method: "GET",
    headers: TRACKING_HEADER,
  };

  try {
    const response = await fetch(url.toString(), requestOptions);
    const data = await response.json();
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
});
