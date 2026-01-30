import { NextResponse } from "next/server";
import { getDhlHeaders, getUserFriendlyError } from "../resources";
import { ShipmentAddressValidationType } from "@omenai/shared-types";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { validateAddressVerificationRequestData } from "@omenai/shared-lib/validations/api/shipment/validateAddressVerificationRequestData";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";
import { validateDHLAddress } from "../../util";
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
      createErrorRollbarReport(
        "shipment: address verification",
        error,
        error_response.status,
      );

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }

    try {
      const data = await validateDHLAddress({
        type,
        countryCode,
        postalCode,
        cityName,
        countyName,
        country,
      });

      return NextResponse.json({ message: "Success", data }, { status: 200 });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      console.log(error);
      createErrorRollbarReport(
        "shipment: address validation",
        error,
        error_response.status,
      );

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
