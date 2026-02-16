import { NextResponse } from "next/server";

import { ShipmentRateRequestTypes } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  createErrorRollbarReport,
  DhlProviderError,
  getShipmentRates,
} from "../../util";

export const POST = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function POST(request: Request) {
    try {
      const body: ShipmentRateRequestTypes = (await request.json()) || {};

      // Call the reusable function
      const appropriateDHLProduct = await getShipmentRates(body);

      return NextResponse.json(
        { message: "Success", appropriateDHLProduct },
        { status: 200 },
      );
    } catch (error: any) {
      // Handle the custom DHL error specifically if needed
      if (error instanceof DhlProviderError) {
        return NextResponse.json(
          { message: error.message, data: error.data },
          { status: error.status },
        );
      }

      // Fallback to your existing error handler
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
