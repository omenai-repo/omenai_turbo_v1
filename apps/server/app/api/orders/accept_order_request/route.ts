import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  CombinedConfig,
  CreateOrderModelTypes,
  NotificationPayload,
  OrderArtworkExhibitionStatus,
  ShipmentDimensions,
  ShipmentRateRequestTypes,
  AddressTypes,
} from "@omenai/shared-types";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

import { sendOrderAcceptedMail } from "@omenai/shared-emails/src/models/orders/orderAcceptedMail";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import {
  createErrorRollbarReport,
  getShipmentRates, // Existing DHL Function
  validateRequestBody,
} from "../../util";
import z from "zod";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { getUPSRates } from "../../ups_service";

// --------------------------------------------------------------------------
// STRIPE TAX CALCULATION
// --------------------------------------------------------------------------
const calculate_taxes = async (
  origin_address: AddressTypes,
  destination_address: AddressTypes,
  amount: number,
  shipping: number,
  order_id: string,
): Promise<{ taxes: number; tax_calculation_id: string }> => {
  if (
    origin_address.countryCode.toLowerCase() !== "us" &&
    destination_address.countryCode.toLowerCase() !== "us"
  ) {
    return { taxes: 0, tax_calculation_id: "" };
  }

  // STEP 1: Dollars to Cents
  const safeAmount = Math.round(amount * 100);
  const safeShipping = Math.round(shipping * 100);

  try {
    const calculation = await stripe.tax.calculations.create({
      currency: "usd",
      line_items: [
        {
          amount: safeAmount,
          reference: order_id,
          tax_behavior: "exclusive",
          quantity: 1,
          tax_code: "txcd_99999999",
        },
      ],
      shipping_cost: {
        amount: safeShipping,
        tax_behavior: "exclusive",
      },
      customer_details: {
        address: {
          line1: destination_address.address_line,
          city: destination_address.city,
          state: destination_address.stateCode,
          postal_code: destination_address.zip,
          country: destination_address.countryCode,
        },
        address_source: "shipping",
      },
      ship_from_details: {
        address: {
          line1: origin_address.address_line,
          city: origin_address.city,
          state: origin_address.stateCode,
          postal_code: origin_address.zip,
          country: origin_address.countryCode,
        },
      },
      expand: ["line_items"],
    });

    //  STEP 2: Cents to Dollars
    return {
      taxes: calculation.tax_amount_exclusive / 100,
      tax_calculation_id: calculation.id,
    };
  } catch (error) {
    console.error("Stripe Tax Calculation Failed:", error);
    return { taxes: 0, tax_calculation_id: "" };
  }
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
  exhibition_status: z
    .object({
      is_on_exhibition: z.boolean(),
      exhibition_end_date: z.string().or(z.date()),
      status: z.enum(["pending", "scheduled"]),
    })
    .nullable(),
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

    // ROUTER LOGIC HAPPENS INSIDE HERE
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
/* HELPERS                                  */
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

/**
 * Calculates shipping rate based on the carrier assigned to the order.
 * Now supports both DHL (legacy) and UPS (new).
 */
async function getShippingRate(
  order: CreateOrderModelTypes,
  dimensions: ShipmentDimensions,
) {
  const carrier = order.shipping_details.shipment_information.carrier;
  const origin = order.shipping_details.addresses.origin;
  const destination = order.shipping_details.addresses.destination;

  try {
    // ----------------------
    // UPS ROUTE
    // ----------------------
    if (carrier === "UPS") {
      // getUPSRates handles the API call and returns a normalized object
      // matching { chargeable_price_in_usd, productName, productCode }
      // It also handles Metric -> Imperial conversion internally
      const upsRate = await getUPSRates(origin, destination, dimensions);
      return upsRate;
    }

    // ----------------------
    // DHL ROUTE (Existing)
    // ----------------------
    const payload: ShipmentRateRequestTypes = {
      originCountryCode: origin.countryCode,
      originCityName: origin.city,
      originPostalCode: origin.zip,
      destinationCountryCode: destination.countryCode,
      destinationCityName: destination.city,
      destinationPostalCode: destination.zip,
      weight: dimensions.weight,
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
    };

    const appropriateDHLProduct = await getShipmentRates(payload);

    return appropriateDHLProduct;
  } catch (error) {
    // We must throw here to stop execution, but wrapping in response format for upstream handler
    throw error;
  }
}

async function buildShipmentInformation(
  order: CreateOrderModelTypes,
  dimensions: ShipmentDimensions,
  rate: any,
) {
  const origin = order.shipping_details.addresses.origin;
  const destination = order.shipping_details.addresses.destination;

  const { taxes, tax_calculation_id } = await calculate_taxes(
    origin,
    destination,
    order.artwork_data.pricing.usd_price,
    Number(rate.chargeable_price_in_usd),
    order.order_id,
  );

  // Determine Carrier Name
  // If it's DHL, your old code did "DHL " + productName.
  // If it's UPS, our service returns "UPS Ground".
  let carrierName = rate.productName;
  if (
    !carrierName.toUpperCase().includes("UPS") &&
    !carrierName.toUpperCase().includes("DHL")
  ) {
    // Fallback for DHL if the rate object just returns "Express Worldwide"
    carrierName = `DHL ${rate.productName}`;
  }

  return {
    ...order.shipping_details.shipment_information,
    carrier: carrierName,
    shipment_product_code: rate.productCode,
    dimensions,
    quote: {
      fees: Number(rate.chargeable_price_in_usd),
      taxes: Number(taxes),
      tax_calculation_id,
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
