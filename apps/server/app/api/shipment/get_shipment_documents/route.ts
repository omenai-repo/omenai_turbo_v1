import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  getDhlHeaders,
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
} from "../resources";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const nextRequest = new NextRequest(request);
    const searchParams = nextRequest.nextUrl.searchParams;
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
          headers: getDhlHeaders(),
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
);
