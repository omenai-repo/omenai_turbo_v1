import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf({
  ...lenientRateLimit,
  allowedRoles: ["user"],
})(async function POST(): Promise<Response> {
  try {
    return NextResponse.json({ message: "This ran well - POST" });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("featured artist", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
