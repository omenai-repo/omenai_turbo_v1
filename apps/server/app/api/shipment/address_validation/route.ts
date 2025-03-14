import { NextRequest, NextResponse } from "next/server";
import { getUserFriendlyError, HEADERS } from "../resources";
import { ShipmentAddressValidationType } from "@omenai/shared-types";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { validateAddressVerificationRequestData } from "@omenai/shared-lib/validations/api/shipment/validateAddressVerificationRequestData";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
export async function POST(request: NextRequest) {
  const {
    type,
    countryCode,
    postalCode,
    cityName,
    countyName,
  }: ShipmentAddressValidationType = await request.json();

  try {
    // Validate and sanitize input
    const requestValidation = validateAddressVerificationRequestData({
      type,
      countryCode,
      postalCode,
      cityName,
      countyName,
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
      `https://express.api.dhl.com/mydhlapi/test/address-validate?type=${type}&countryCode=${countryCode}&cityName=${cityName.toLowerCase()}&postalCode=${postalCode}&countyName=${countyName.toLowerCase()}&strictValidation=${false}`,
      requestOptions
    );
    const data = await response.json();
    // TODO: Fix for multiple DHL error responses
    if (!response.ok) {
      console.log(data);
      const error_message = getUserFriendlyError(data.detail);
      throw new BadRequestError(error_message);
    }
    return NextResponse.json({ message: "Success", data }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
