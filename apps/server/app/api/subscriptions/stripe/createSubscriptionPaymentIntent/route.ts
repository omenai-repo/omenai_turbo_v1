import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

import { CombinedConfig } from "@omenai/shared-types";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { amount, gallery_id, meta } = await request.json();
    const gallery = await AccountGallery.findOne(
      { gallery_id },
      "stripe_customer_id"
    );
    if (!gallery)
      throw new ServerError("Something went wrong. Please try again");
    // Use an existing Customer ID if this is a returning customer.

    let customer;

    if (gallery?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(gallery.stripe_customer_id);
    } else {
      // Create new Stripe customer
      customer = await stripe.customers.create({
        email: meta.email,
        metadata: {
          ...meta,
        },
      });

      // Update user with Stripe customer ID
      await AccountGallery.updateOne(
        { gallery_id },
        { $set: { stripe_customer_id: customer.id } }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customer.id, // retrieved/stored earlier
      setup_future_usage: "off_session", // tells Stripe: also save payment method
      automatic_payment_methods: { enabled: true },
      metadata: { ...meta },
    });

    return NextResponse.json({
      message: "Payment Intent created",
      paymentIntent: paymentIntent.client_secret,
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
