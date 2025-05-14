import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { HEADERS, OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT } from "../resources";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackingNumber = searchParams.get("t_num");
  const typeCode = searchParams.get("t_code");
  const pickupYearAndMonth = searchParams.get("y_m");
  const shipperAccountNumber = OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT;
  try {
    if (
      !trackingNumber ||
      !typeCode ||
      !pickupYearAndMonth ||
      !shipperAccountNumber
    )
      throw new BadRequestError("Invalid URL parameters");
    try {
      const requestOptions = {
        method: "GET",
        headers: HEADERS,
      };

      const response = await fetch(
        `https://express.api.dhl.com/mydhlapi/test/shipments/${trackingNumber}/get-image?shipperAccountNumber=${shipperAccountNumber}&typeCode=${typeCode}&pickupYearAndMonth=${pickupYearAndMonth}&encodingFormat=pdf&allInOnePDF=true&compressedPackage=false`,
        requestOptions
      );
      const data = await response.json();
      return NextResponse.json({ message: "Success", data }, { status: 200 });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
