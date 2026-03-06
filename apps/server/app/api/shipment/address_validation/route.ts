import { NextResponse } from "next/server";
import { ShipmentAddressValidationType } from "@omenai/shared-types";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { validateAddressVerificationRequestData } from "@omenai/shared-lib/validations/api/shipment/validateAddressVerificationRequestData";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateDHLAddress } from "../../util";
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

      console.log(requestValidation);
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

      console.log(data);

      return NextResponse.json({ message: "Success", data }, { status: 200 });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
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
