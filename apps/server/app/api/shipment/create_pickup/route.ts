import { NextResponse } from "next/server";
import {
  getDhlHeaders,
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
} from "../resources";
import { ShipmentPickupRequestDataTypes } from "@omenai/shared-types";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    const {
      originCountryCode,
      specialInstructions,
      artistDetails,
      shipment_product_code,
      dimensions,
    }: ShipmentPickupRequestDataTypes = await request.json();
    if (
      !originCountryCode ||
      !artistDetails ||
      !shipment_product_code ||
      !dimensions
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing one or more required fields",
        },
        { status: 400 }
      );
    }

    const plannedPickupDateAndTime = getFutureShipmentDate(
      2,
      true,
      originCountryCode,
      {
        hours: "12",
        minutes: "00",
      }
    );

    const pickupRequestPayload = {
      plannedPickupDateAndTime,
      closeTime: "18:00",
      location: "residence",
      locationType: "residence",
      accounts: [
        {
          typeCode: "shipper",
          number: OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
        },
        {
          typeCode: "payer",
          number: OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
        },
      ],
      specialInstructions: [
        {
          value: specialInstructions || "No special instructions",
        },
      ],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: "60616",
            cityName: "Illinois",
            countryCode: "US",
            countyName: "Chicago",
            addressLine1: "2035 S State St",
          },
          contactInformation: {
            email: "gbenro@omenai.net",
            phone: " +7733521307",
            companyName: "OMENAI INC",
            fullName: "Gbenro",
          },
        },
        pickupDetails: {
          postalAddress: {
            postalCode: artistDetails.address.zip,
            cityName: artistDetails.address.city,
            countryCode: artistDetails.address.countryCode,
            addressLine1: artistDetails.address.address_line,
          },
          contactInformation: {
            email: artistDetails.email,
            phone: artistDetails.phone,
            companyName: "OMENAI INC",
            fullName: artistDetails.fullname,
          },
        },
      },
      shipmentDetails: [
        {
          packages: [
            {
              weight: dimensions.weight,
              dimensions: {
                length: dimensions.length,
                width: dimensions.width,
                height: dimensions.height,
              },
            },
          ],
          productCode: shipment_product_code,
          unitOfMeasurement: "metric",
        },
      ],
    };
    try {
      const requestOptions = {
        method: "POST",
        headers: getDhlHeaders(),
        body: JSON.stringify(pickupRequestPayload),
      };

      const response = await fetch(
        `https://express.api.dhl.com/mydhlapi/test/pickups`,
        requestOptions
      );
      const data = await response.json();
      return NextResponse.json({ message: "Success", data }, { status: 200 });
    } catch (error) {
      console.log(error);
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "shipment: create pickup",
        error,
        error_response.status
      );
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  }
);
