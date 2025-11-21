import { plan_details } from "./../../../../../dashboard/app/gallery/billing/plans/plan_details";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
  ServiceUnavailableError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  CombinedConfig,
  SubscriptionModelSchemaTypes,
} from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const isStripePaymentEnabled =
      (await fetchConfigCatValue("stripe_payment_enabled", "high")) ?? false;
    if (!isStripePaymentEnabled) {
      throw new ServiceUnavailableError("Stripe payment is currently disabled");
    }
    await connectMongoDB();

    const { item, amount, seller_id, meta, success_url, cancel_url } =
      await request.json();

    // Fetch gallery and subscription concurrently
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

    const baseAmountCents = Math.round(amount * 100);
    const commissionCents = Math.round(
      (meta.unit_price * commissionRate + meta.shipping_cost + meta.tax_fees) *
        100
    );

    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: item },
            unit_amount: baseAmountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: commissionCents,
        transfer_data: {
          destination: gallery.connected_account_id,
        },
      },
      metadata: {
        seller_id,
        type: "purchase",
        commission: Math.round(meta.unit_price * commissionRate),
      },
      expires_at: expiresAt,
      mode: "payment",
      success_url,
      cancel_url,
    });

    if (!session)
      throw new ServerError(
        "Cannot proceed with this purchase at the moment. Please try again or contact support"
      );

    return NextResponse.json({
      message: "Checkout Session created... Redirecting",
      url: session.url,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "stripe: check checkout session",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
