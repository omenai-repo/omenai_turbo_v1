import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { NextResponse } from "next/server";
import {
  lenientRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { CombinedConfig } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const isSubscriptionEnabled = (await fetchConfigCatValue(
      "subscription_creation_enabled",
      "high"
    )) as boolean;

    if (!isSubscriptionEnabled)
      throw new ForbiddenError("Subscriptions are currently disabled");
    await connectMongoDB();
    const { amount, gallery_id, meta } = await request.json();
    const subscription_data = await Subscriptions.findOne(
      { "customer.gallery_id": gallery_id },
      "paymentMethod stripe_customer_id customer"
    );
    if (!subscription_data)
      throw new NotFoundError("No subscription record found for this user");
    // Use an existing Customer ID if this is a returning customer.

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: subscription_data.stripe_customer_id, // retrieved/stored earlier
      payment_method: subscription_data.paymentMethod.id,
      off_session: true, // important for stored cards
      confirm: true, // attempt charge immediately
      metadata: { ...meta, type: "subscription" },
    });

    //   Create a record of this transaction

    return NextResponse.json({
      message: "Payment Intent created",
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
