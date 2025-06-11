import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const url = dashboard_url();
      const { account } = await request.json();

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
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
