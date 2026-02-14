import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { dashboard_url } from "@omenai/url-config/src/config";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const CreateAccountSchema = z.object({
  account: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const url = dashboard_url();
    const { account } = await validateRequestBody(request, CreateAccountSchema);

    const accountLink = await stripe.accountLinks.create({
      account: account,
      refresh_url: `${url}/gallery/payouts/refresh?id=${account}`,
      return_url: `${url}/gallery/payouts`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error(error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "stripe: create account link",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
