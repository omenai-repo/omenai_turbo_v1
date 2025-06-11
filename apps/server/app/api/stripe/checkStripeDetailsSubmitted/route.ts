import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitAndHighlight(standardRateLimit)(
  async function POST(request: Request) {
    try {
      const { accountId } = await request.json();

      const account = await stripe.accounts.retrieve(accountId);

      return NextResponse.json({
        details_submitted: account.details_submitted,
      });
    } catch (error) {
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
