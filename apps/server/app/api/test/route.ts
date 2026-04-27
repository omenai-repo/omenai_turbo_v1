import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../util";
const config: CombinedConfig = {
  ...standardRateLimit, // use strictRateLimit for sensitive operations to prevent brute force attacks
  allowedRoles: ["admin"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
  _?: Response | NextResponse<unknown>,
  session?: SessionData & { csrfToken: string },
) {
  try {
    // Code blocks

    return NextResponse.json({});
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "transactions: create transaction",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
