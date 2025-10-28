import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  AddressTypes,
  CombinedConfig,
  CreateOrderModelTypes,
  HoldStatus,
  NotificationPayload,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
  ShipmentRateRequestTypes,
} from "@omenai/shared-types";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { getApiUrl } from "@omenai/url-config/src/config";
import Taxjar from "taxjar";
import { NexusTransactions } from "@omenai/shared-models/models/transactions/NexusModelSchema";
import { sendOrderAcceptedMail } from "@omenai/shared-emails/src/models/orders/orderAcceptedMail";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";

const client = new Taxjar({
  apiKey: process.env.TAXJAR_API_KEY!,
  apiUrl: "https://api.sandbox.taxjar.com",
});

const API_URL = getApiUrl();
const HEADERS = {
  Origin: "https://omenai.app",
  "Content-Type": "application/json",
};

const calculate_taxes = async (
  origin_address: AddressTypes,
  destination_address: AddressTypes,
  amount: number,
  shipping: number
): Promise<number> => {
  if (
    origin_address.countryCode !== "US" &&
    destination_address.countryCode !== "US"
  )
    return 0;

  const nexus_state = await NexusTransactions.findOne({
    stateCode: origin_address.stateCode,
  });

  if (!nexus_state) return 0;

  if (!nexus_state.is_nexus_breached) return 0;

  const res = await client.taxForOrder({
    to_country: destination_address.countryCode,
    to_zip: destination_address.zip,
    to_state: destination_address.stateCode,
    from_country: origin_address.countryCode,
    from_zip: origin_address.zip,
    from_state: origin_address.stateCode,
    amount,
    shipping,
  });

  const response = res.tax?.amount_to_collect;
  return response;
};

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  const client = await connectMongoDB();
  const session = await client.startSession();
  try {
    session.startTransaction();
    const data: {
      order_id: string;
      dimensions: ShipmentDimensions;
      exhibition_status: OrderArtworkExhibitionStatus | null;
      hold_status: HoldStatus | null;
      specialInstructions?: string;
    } = await request.json();

    // console.log(data);
    // Basic validation check
    if (!data.order_id || !data.dimensions) {
      throw new BadRequestError(
        "Invalid params - Order ID or dimensions is missing"
      );
    }

    const order: CreateOrderModelTypes | null = await CreateOrder.findOne({
      order_id: data.order_id,
    });

    // Check if order exists in DB
    if (!order) throw new NotFoundError("Order data not found. Try again");

    if (order.seller_designation === "gallery") {
      const active_subscription = await Subscriptions.findOne(
        { "customer.gallery_id": order.seller_details.id },
        "plan_details status"
      );

      if (!active_subscription || active_subscription.status !== "active")
        throw new ForbiddenError(
          "Please activate a subscription to access this feature"
        );
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

    if (process.env.NODE_ENV !== "production") {
      console.log(rate_payload);
    }

    let shipping_rate_data;
    const cache = new Map();
    const cacheKey = JSON.stringify(rate_payload);

    if (cache.has(cacheKey)) {
      shipping_rate_data = cache.get(cacheKey);
    } else {
      try {
        const rate_payload_string = JSON.stringify(rate_payload);
        const calculate_order_shipping_rate = await fetch(
          `${API_URL}/api/shipment/get_rate`,
          {
            method: "POST",
            body: rate_payload_string,
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
        cache.set(cacheKey, shipping_rate_data);
      } catch (error) {
        const error_response = handleErrorEdgeCases(error);
        return NextResponse.json(
          { message: error_response?.message },
          { status: error_response?.status }
        );
      }
    }

    const origin_address: AddressTypes =
      order.shipping_details.addresses.origin;
    const destination_address: AddressTypes =
      order.shipping_details.addresses.destination;

    const taxes: number = await calculate_taxes(
      origin_address,
      destination_address,
      order.artwork_data.pricing.usd_price,
      +shipping_rate_data.chargeable_price_in_usd
    );
    // Save shipping and order information
    const shipment_information = {
      ...order.shipping_details.shipment_information,
      carrier: `DHL ${shipping_rate_data.productName}`,
      shipment_product_code: shipping_rate_data.productCode,
      dimensions: data.dimensions,
      quote: {
        fees: Number(shipping_rate_data.chargeable_price_in_usd),
        taxes: Number(taxes),
      },
    };

    const now = toUTCDate(new Date());
    const hrs24Later = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiresAt = hrs24Later.toISOString();

    // Update order document with new data
    await CreateOrder.updateOne(
      { order_id: data.order_id },
      {
        $set: {
          exhibition_status: { ...data.exhibition_status, status: "pending" },
          hold_status: { is_hold: true, hold_end_date: expiresAt },
          "shipping_details.additional_information": data.specialInstructions
            ? data.specialInstructions
            : "",
          "shipping_details.shipment_information": shipment_information,
          "order_accepted.status": "accepted",
          expiresAt,
        },
      },
      { session }
    );

    await session.commitTransaction();

    const buyer_push_token = await DeviceManagement.findOne(
      { auth_id: order.buyer_details.id },
      "device_push_token"
    );

    if (buyer_push_token?.device_push_token) {
      const buyer_notif_payload: NotificationPayload = {
        to: buyer_push_token.device_push_token,
        title: "Order request accepted",
        body: "Your order request has been accepted for purchase",
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {
            orderId: order.order_id,
            date: toUTCDate(new Date()),
          },
          userId: order.buyer_details.id,
        },
      };

      await createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notification_workflow_buyer_${order.order_id}_${generateDigit(2)}`,
        JSON.stringify(buyer_notif_payload)
      ).catch((error) => {
        console.error("Failed to send buyer notification:", error);
      });
    }

    //TODO: Update mail to indicate the user has 24 hrs to pay
    await sendOrderAcceptedMail({
      name: order.buyer_details.name,
      email: order.buyer_details.email,
      order_id: order.order_id,
      user_id: order.buyer_details.id,
      artwork_data: order.artwork_data,
    });

    // Return response
    return NextResponse.json(
      { message: "Order successfully accepted.", data: shipment_information },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  } finally {
    await session.endSession();
  }
});
