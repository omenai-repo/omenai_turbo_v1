import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  AddressTypes,
  CombinedConfig,
  CreateOrderModelTypes,
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
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

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
  shipping: number,
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

  return res.tax?.amount_to_collect;
};

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

const AcceptOrderRequestSchema = z.object({
  order_id: z.string(),
  specialInstructions: z.string().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
  }),
  exhibition_status: z.object({
    is_on_exhibition: z.boolean(),
    exhibition_end_date: z.string().or(z.date()),
    status: z.enum(["pending", "scheduled"]),
  }),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  await connectMongoDB();

  try {
    const data = await validateRequestBody(request, AcceptOrderRequestSchema);

    validatePayload(data);

    const order = await fetchOrder(data.order_id);

    await validateSellerSubscription(order);

    const shipping_rate_data = await getShippingRate(order, data.dimensions);
    const shipment_information = await buildShipmentInformation(
      order,
      data.dimensions,
      shipping_rate_data,
    );

    const expiresAt = buildExpiryDate();

    await updateOrder({
      order_id: data.order_id,
      exhibition_status: data.exhibition_status,
      specialInstructions: data.specialInstructions,
      shipment_information,
      expiresAt,
    });

    await notifyBuyer(order);
    await sendOrderAcceptedMail({
      name: order.buyer_details.name,
      email: order.buyer_details.email,
      order_id: order.order_id,
      user_id: order.buyer_details.id,
      artwork_data: order.artwork_data,
    });

    return NextResponse.json(
      { message: "Order successfully accepted.", data: shipment_information },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: accept order request",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

function validatePayload(data: any) {
  if (!data?.order_id || !data?.dimensions) {
    throw new BadRequestError(
      "Invalid params - Order ID or dimensions is missing",
    );
  }
}

async function fetchOrder(order_id: string) {
  const order = await CreateOrder.findOne({ order_id });
  if (!order) {
    throw new NotFoundError("Order data not found. Try again");
  }
  return order;
}

async function validateSellerSubscription(order: CreateOrderModelTypes) {
  if (order.seller_designation !== "gallery") return;

  const active_subscription = await Subscriptions.findOne(
    { "customer.gallery_id": order.seller_details.id },
    "plan_details status",
  );

  if (active_subscription?.status !== "active") {
    throw new ForbiddenError(
      "Please activate a subscription to access this feature",
    );
  }
}

async function getShippingRate(
  order: CreateOrderModelTypes,
  dimensions: ShipmentDimensions,
) {
  const payload: ShipmentRateRequestTypes = {
    originCountryCode: order.shipping_details.addresses.origin.countryCode,
    originCityName: order.shipping_details.addresses.origin.city,
    originPostalCode: order.shipping_details.addresses.origin.zip,
    destinationCountryCode:
      order.shipping_details.addresses.destination.countryCode,
    destinationCityName: order.shipping_details.addresses.destination.city,
    destinationPostalCode: order.shipping_details.addresses.destination.zip,
    weight: dimensions.weight,
    length: dimensions.length,
    width: dimensions.width,
    height: dimensions.height,
  };

  try {
    const response = await fetch(`${API_URL}/api/shipment/get_rate`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: HEADERS,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message);
    }

    return json.appropriateDHLProduct;
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: calculate shipping rate",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status },
    );
  }
}

async function buildShipmentInformation(
  order: CreateOrderModelTypes,
  dimensions: ShipmentDimensions,
  rate: any,
) {
  const origin = order.shipping_details.addresses.origin;
  const destination = order.shipping_details.addresses.destination;

  const taxes = await calculate_taxes(
    origin,
    destination,
    order.artwork_data.pricing.usd_price,
    Number(rate.chargeable_price_in_usd),
  );

  return {
    ...order.shipping_details.shipment_information,
    carrier: `DHL ${rate.productName}`,
    shipment_product_code: rate.productCode,
    dimensions,
    quote: {
      fees: Number(rate.chargeable_price_in_usd),
      taxes: Number(taxes),
    },
  };
}

function buildExpiryDate() {
  const now = toUTCDate(new Date());
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

async function updateOrder({
  order_id,
  exhibition_status,
  specialInstructions,
  shipment_information,
  expiresAt,
}: {
  order_id: string;
  exhibition_status: OrderArtworkExhibitionStatus | null;
  specialInstructions?: string;
  shipment_information: any;
  expiresAt: string;
}) {
  if (!expiresAt)
    throw new Error(
      "Something went wrong. Please try again or contact support",
    );
  await CreateOrder.updateOne(
    { order_id },
    {
      $set: {
        exhibition_status: { ...exhibition_status, status: "pending" },
        hold_status: { is_hold: true, hold_end_date: expiresAt },
        "shipping_details.additional_information": specialInstructions || "",
        "shipping_details.shipment_information": shipment_information,
        "order_accepted.status": "accepted",
        expiresAt,
      },
    },
  );
}

async function notifyBuyer(order: CreateOrderModelTypes) {
  const buyer_push_token = await DeviceManagement.findOne(
    { auth_id: order.buyer_details.id },
    "device_push_token",
  );

  if (!buyer_push_token?.device_push_token) return;

  const payload: NotificationPayload = {
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
    JSON.stringify(payload),
  ).catch((error) => {
    createErrorRollbarReport(
      "order: failed to send buyer notification",
      error,
      500,
    );
  });
}
