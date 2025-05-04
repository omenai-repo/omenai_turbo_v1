import { NextRequest, NextResponse } from "next/server";
import { getLatLng, HEADERS } from "../resources";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const order_id = searchParams.get("order_id");
  if (!order_id)
    throw new BadRequestError("Invalid parameters - order_id required");

  await connectMongoDB();
  const order_address = await CreateOrder.findOne(
    { order_id },
    "shipping_details"
  );

  const tracking_number =
    order_address.shipping_details.shipment_information.tracking.id;

  if (!order_address)
    throw new NotFoundError("No order found for the given order id");
  const origin_location = `${order_address.shipping_details.addresses.origin.zip}, ${order_address.shipping_details.addresses.origin.state}, ${order_address.shipping_details.addresses.origin.country}`;
  const destination_location = `${order_address.shipping_details.addresses.destination.zip}, ${order_address.shipping_details.addresses.destination.state}, ${order_address.shipping_details.addresses.destination.country}`;
  const get_origin_geo_location = await getLatLng(origin_location);
  await sleep(1100);
  const get_destination_geo_location = await getLatLng(destination_location);

  // if (!get_origin_geo_location || !get_destination_geo_location)
  //   throw new ServerError("Unable to determine geo location coordinates");

  const API_URL = `https://express.api.dhl.com/mydhlapi/test/shipments/${tracking_number}/tracking`;

  const url = new URL(API_URL);
  const requestOptions = {
    method: "GET",
    headers: HEADERS,
  };

  try {
    const response = await fetch(url.toString(), requestOptions);
    if (!response.ok)
      throw new ServerError(
        "Something went wrong. Please try again or contact support"
      );

    const data = await response.json();
    return NextResponse.json(
      {
        message: "Successfully fetched shipment events",
        events: data.shipments[0].events,
        coordinates: {
          origin: get_origin_geo_location,
          destination: get_destination_geo_location,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
