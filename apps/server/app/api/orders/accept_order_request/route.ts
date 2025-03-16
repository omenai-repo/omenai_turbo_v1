import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  CreateOrderModelTypes,
  HoldStatus,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
  ShipmentRateRequestTypes,
} from "@omenai/shared-types";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { getApiUrl } from "@omenai/url-config/src/config";

const API_URL = getApiUrl();
const HEADERS = {
  Origin: "https://omenai.app",
  "Content-Type": "application/json",
};

export async function POST(request: NextRequest) {
  const client = await connectMongoDB();
  const session = await client.startSession();
  try {
    session.startTransaction();
    const data: {
      order_id: string;
      dimensions: ShipmentDimensions;
      exhibition_status: OrderArtworkExhibitionStatus;
      hold_status: HoldStatus;
    } = await request.json();

    // Basic validation check
    if (
      !data.order_id ||
      !data.dimensions ||
      !data.hold_status ||
      !data.exhibition_status
    ) {
      throw new BadRequestError("Invalid params");
    }

    const order: CreateOrderModelTypes | null = await CreateOrder.findOne({
      order_id: data.order_id,
    });

    // Check if order exists in DB
    if (!order) {
      throw new NotFoundError("Order data not found. Try again");
    }

    // Calculate order shipping rate
    const rate_payload: ShipmentRateRequestTypes = {
      originCountryCode: order.shipping_details.addresses.origin.countryCode,
      originCityName: order.shipping_details.addresses.origin.city,
      originPostalCode: order.shipping_details.addresses.origin.zip,
      destinationCountryCode:
        order.shipping_details.addresses.destination.countryCode,
      destinationCityName: order.shipping_details.addresses.destination.city,
      destinationPostalCode: order.shipping_details.addresses.destination.zip,
      weight: data.dimensions.weight,
      length: data.dimensions.length,
      width: data.dimensions.width,
      height: data.dimensions.height,
    };

    let shipping_rate_data;
    try {
      const calculate_order_shipping_rate = await fetch(
        `${API_URL}/api/shipment/get_rate`,
        {
          method: "POST",
          body: JSON.stringify(rate_payload),
          headers: HEADERS,
        }
      );

      const rate_response = await calculate_order_shipping_rate.json();
      if (!calculate_order_shipping_rate.ok)
        return NextResponse.json(
          { message: rate_response?.message },
          { status: calculate_order_shipping_rate.status }
        );
      shipping_rate_data = rate_response.appropriateDHLProduct;
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }

    // TODO: Implement tax calculations
    // Save shipping and order information
    const shipment_information = {
      ...order.shipping_details.shipment_information,
      carrier: `DHL ${shipping_rate_data.productName}`,
      shipment_product_code: shipping_rate_data.productCode,
      dimensions: data.dimensions,
      quote: {
        fees: shipping_rate_data.chargeable_price_in_usd,
        taxes: 0,
      },
    };

    // Update order document with new data
    await CreateOrder.updateOne(
      { order_id: data.order_id },
      {
        $set: {
          exhibition_status: data.exhibition_status,
          hold_status: data.hold_status,
          "shipping_details.shipment_information": shipment_information,
          "order_accepted.status": "accepted",
        },
      },
      { session }
    );

    await session.commitTransaction();

    // Return response
    return NextResponse.json(
      { message: "Order successfully accepted." },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  } finally {
    await session.endSession();
  }
}
