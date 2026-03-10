import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  AddressTypes,
  CombinedConfig,
  CreateOrderModelTypes,
  OrderShippingDetailsTypes,
  ShipmentAddressValidationType,
} from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  createErrorRollbarReport,
  validateDHLAddress,
  validateRequestBody,
} from "../../util";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery", "artist"],
};

const AddressSchema: z.ZodType<AddressTypes> = z.object({
  address_line: z.string(),
  state: z.string(),
  country: z.string(),
  city: z.string(),
  zip: z.string(),
  stateCode: z.string().max(2),
  countryCode: z.string().max(2),
});

const AddressUpdateZodSchema = z.object({
  type: z.enum(["pickup", "delivery"]),
  pickupAddress: AddressSchema,
  order_id: z.string(),
});

export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  request: Request,
) {
  try {
    const { type, pickupAddress, order_id } = await validateRequestBody(
      request,
      AddressUpdateZodSchema,
    );

    const { country, countryCode, state, city, zip } = pickupAddress;

    const order = (await CreateOrder.findOne({
      order_id,
    }).lean()) as CreateOrderModelTypes | null;

    if (!order) {
      throw new NotFoundError("No Order record was found for this ID");
    }

    const originCountry = countryCode.toLowerCase();
    const destCountry =
      order.shipping_details.addresses.destination.countryCode.toLowerCase();

    // 1. Determine the carrier cleanly
    const isDomesticUS = originCountry === "us" && destCountry === "us";
    const isDomesticNG = originCountry === "ng" && destCountry === "ng";

    const carrier: OrderShippingDetailsTypes["shipment_information"]["carrier"] =
      isDomesticUS || isDomesticNG ? "UPS" : "DHL";

    // 2. Validate ONLY if the carrier is DHL
    if (carrier === "DHL") {
      await validateDHLAddress({
        type,
        countryCode,
        postalCode: zip,
        cityName: city,
        countyName: state,
        country,
      });
    }

    // 3. Update the database
    const updateAddress = await CreateOrder.updateOne(
      { order_id },
      {
        $set: {
          "shipping_details.addresses.origin": pickupAddress,
          "shipping_details.shipment_information.carrier": carrier,
        },
      },
    );

    // 4. Fixed verification check: ensure the query was acknowledged and found the doc
    if (!updateAddress.acknowledged || updateAddress.matchedCount === 0) {
      throw new ServerError(
        "An error occurred while updating pickup address. Please try again or contact support",
      );
    }

    return NextResponse.json(
      {
        message: "Pickup address verified successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: Update order pickup address",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
