import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import {
  ServerError,
  ForbiddenError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const { amount, seller_id, meta } = await request.json();
      const gallery = await AccountGallery.findOne(
        { gallery_id: seller_id },
        "connected_account_id"
      );
      if (!gallery)
        throw new ServerError("Something went wrong. Please try again");
      // Use an existing Customer ID if this is a returning customer.

      // Get current plan details to ascertain plan package

      const active_subscription = await Subscriptions.findOne(
        { "customer.gallery_id": seller_id },
        "plan_details status"
      );

      // Calculate commision value based on plan package
      if (!active_subscription || active_subscription.status !== "active")
        throw new ForbiddenError("No active subscription for this user");

      const commision_rate =
        active_subscription.plan_details.type.toLowerCase() === "premium"
          ? 0.15
          : active_subscription.plan_details.type.toLowerCase() === "pro"
            ? 0.2
            : 0.25;
      const commission = Math.round(
        meta.unit_price * commision_rate * 100 +
          meta.shipping_cost * 100 +
          meta.tax_fees * 100
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: {
          ...meta,
          seller_id,
          commission: Math.round(meta.unit_price * commision_rate),
        },
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: commission,
        transfer_data: {
          destination: gallery.connected_account_id,
        },
      });

      return NextResponse.json({
        paymentIntent: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PK!,
      });
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
