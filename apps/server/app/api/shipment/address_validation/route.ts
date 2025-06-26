import { NextRequest, NextResponse } from "next/server";
import { getUserFriendlyError, HEADERS } from "../resources";
import { ShipmentAddressValidationType } from "@omenai/shared-types";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { validateAddressVerificationRequestData } from "@omenai/shared-lib/validations/api/shipment/validateAddressVerificationRequestData";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function POST(request: Request) {
    const {
      type,
      countryCode,
      postalCode,
      cityName,
      countyName,
      country,
    }: ShipmentAddressValidationType = await request.json();

    try {
      // Validate and sanitize input
      const requestValidation = validateAddressVerificationRequestData({
        type,
        countryCode,
        postalCode,
      });

      if (requestValidation) throw new BadRequestError(requestValidation);
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }

    try {
      const requestOptions = {
        method: "GET",
        headers: HEADERS,
      };

      const response = await fetch(
        `https://express.api.dhl.com/mydhlapi/test/address-validate?type=${type}&countryCode=${countryCode}&cityName=${cityName?.toLowerCase() || country}&postalCode=${postalCode}&countyName=${countyName?.toLowerCase() || cityName || country}&strictValidation=${false}`,
        requestOptions
      );
      const data = await response.json();
      // TODO: Fix for multiple DHL error responses
      if (!response.ok) {
        const error_message = getUserFriendlyError(data.detail);
        throw new BadRequestError(error_message);
      }
      return NextResponse.json({ message: "Success", data }, { status: 200 });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      console.log(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
