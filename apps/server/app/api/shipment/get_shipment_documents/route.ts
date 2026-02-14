import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  getDhlHeaders,
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
} from "../resources";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";
const GetShipmentDocumentsSchema = z.object({
  trackingNumber: z.string(),
  typeCode: z.string(),
  pickupYearAndMonth: z.string(),
});
export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const nextRequest = new NextRequest(request);
    const searchParams = nextRequest.nextUrl.searchParams;
    const trackingNumberParams = searchParams.get("t_num");
    const typeCodeParams = searchParams.get("t_code");
    const pickupYearAndMonthParams = searchParams.get("y_m");
    const shipperAccountNumber = OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT;
    try {
      const { pickupYearAndMonth, trackingNumber, typeCode } =
        validateGetRouteParams(GetShipmentDocumentsSchema, {
          pickupYearAndMonth: pickupYearAndMonthParams,
          trackingNumber: trackingNumberParams,
          typeCode: typeCodeParams,
        });
      try {
        const requestOptions = {
          method: "GET",
          headers: getDhlHeaders(),
        };

        const response = await fetch(
          `https://express.api.dhl.com/mydhlapi/test/shipments/${trackingNumber}/get-image?shipperAccountNumber=${shipperAccountNumber}&typeCode=${typeCode}&pickupYearAndMonth=${pickupYearAndMonth}&encodingFormat=pdf&allInOnePDF=true&compressedPackage=false`,
          requestOptions,
        );
        const data = await response.json();
        return NextResponse.json({ message: "Success", data }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ message: "Error", error }, { status: 500 });
      }
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "shipment: get shipment documents",
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
