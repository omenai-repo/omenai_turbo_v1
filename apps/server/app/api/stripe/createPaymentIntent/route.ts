import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import { ForbiddenError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const isStripePaymentEnabled =
        (await fetchConfigCatValue("stripe_payment_enabled", "high")) ?? false;
      if (!isStripePaymentEnabled) {
        throw new ForbiddenError("Stripe payment is currently disabled");
      }
      await connectMongoDB();
      const { amount, seller_id, meta } = await request.json();

      const [gallery, active_subscription] = await Promise.all([
        AccountGallery.findOne({ gallery_id: seller_id })
          .select("connected_account_id")
          .lean() as unknown as { connected_account_id: string },
        Subscriptions.findOne({ "customer.gallery_id": seller_id })
          .select("plan_details status")
          .lean() as unknown as {
          plan_details: SubscriptionModelSchemaTypes["plan_details"];
          status: SubscriptionModelSchemaTypes["status"];
        },
      ]);

      if (
        !gallery ||
        !active_subscription ||
        active_subscription.status !== "active"
      ) {
        throw new ForbiddenError(
          "Cannot proceed with this purchase at the moment. Please try again later or contact support if this persists"
        );
      }
      // Determine commission rate by plan type
      const planType = active_subscription.plan_details.type?.toLowerCase();

      const rateMap: Record<string, number> = {
        premium: 0.15,
        pro: 0.2,
        basic: 0.25,
      };
      const commissionRate = rateMap[planType] ?? rateMap.basic;

      const commissionCents = Math.round(
        (meta.unit_price * commissionRate +
          meta.shipping_cost +
          meta.tax_fees) *
          100
      );

      const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: {
          ...meta,
          seller_id,
          commission: Math.round(meta.unit_price * commissionRate),
          type: "purchase",
        },

        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: commissionCents,
        transfer_data: {
          destination: gallery.connected_account_id,
        },
        expiresAt,
      });

      return NextResponse.json({
        paymentIntent: paymentIntent.client_secret,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PK!,
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
