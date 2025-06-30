import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET() {
    try {
      return NextResponse.json({});
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
