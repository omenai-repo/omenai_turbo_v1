import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const { accountId } = await request.json();

    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    console.error(error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "stripe: check stripe details submitted",
      error,
      error_response.status
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
