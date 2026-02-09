import { NextResponse } from "next/server";
import {
  DHL_API_URL_TEST,
  getDhlHeaders,
  getUserFriendlyError,
  OMENAI_INC_DHL_EXPRESS_EXPORT_ACCOUNT,
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
  selectAppropriateDHLProduct,
} from "../resources";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";
import { ShipmentRateRequestTypes } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { validateShipmentRateRequest } from "@omenai/shared-lib/validations/api/shipment/validateShipmentRateRequestData";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";
const API_URL = `${DHL_API_URL_TEST}/rates`;

export const POST = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function POST(request: Request) {
    const {
      originCountryCode,
      originCityName,
      originPostalCode,
      destinationCountryCode,
      destinationCityName,
      destinationPostalCode,
      weight,
      length,
      width,
      height,
    }: ShipmentRateRequestTypes = (await request.json()) || {};

    try {
    } catch (error) {
      // Validate and sanitize input
      const requestValidation = validateShipmentRateRequest({
        originCountryCode,
        originCityName,
        originPostalCode,
        destinationCountryCode,
        destinationCityName,
        destinationPostalCode,
        weight,
        length,
        width,
        height,
      });

      if (requestValidation) throw new BadRequestError(requestValidation);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }

    try {
      const requestOptions = {
        method: "GET",
        headers: getDhlHeaders(),
      };

      const plannedShippingDate = await getFutureShipmentDate(
        5,
        false,
        originCountryCode,
      );

      const account_to_use =
        originCountryCode === destinationCountryCode
          ? OMENAI_INC_DHL_EXPRESS_EXPORT_ACCOUNT
          : OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT;

      const url = new URL(API_URL);
      url.searchParams.append("accountNumber", account_to_use);
      url.searchParams.append("originCountryCode", originCountryCode);
      url.searchParams.append("originCityName", originCityName);
      url.searchParams.append("destinationCountryCode", destinationCountryCode);
      url.searchParams.append("destinationCityName", destinationCityName);
      url.searchParams.append("weight", weight.toString());
      url.searchParams.append("length", length.toString());
      url.searchParams.append("width", width.toString());
      url.searchParams.append("height", height.toString());
      url.searchParams.append("plannedShippingDate", plannedShippingDate);
      url.searchParams.append(
        "isCustomsDeclarable",
        (originCountryCode !== destinationCountryCode).toString(),
      );
      url.searchParams.append("originPostalCode", originPostalCode);
      url.searchParams.append("destinationPostalCode", destinationPostalCode);
      url.searchParams.append("unitOfMeasurement", "metric");
      url.searchParams.append("strictValidation", "false");

      const response = await fetch(url.toString(), requestOptions);

      const data = await response.json();

      if (!response.ok) {
        const error_message = getUserFriendlyError(data.detail);
        return NextResponse.json(
          { message: error_message, data },
          { status: data.status },
        );
      }

      const appropriateDHLProduct = await selectAppropriateDHLProduct(
        data.products,
      );

      if (appropriateDHLProduct === null)
        throw new NotFoundError(
          "No DHL product found for this shipment. Please contact support",
        );

      //DONE: Save relevant data to database before returning response

      return NextResponse.json(
        { message: "Success", appropriateDHLProduct },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "shipment: get rate",
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
