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

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { amount, gallery_id, meta } = await request.json();
    const gallery = await AccountGallery.findOne(
      { gallery_id },
      "connected_account_id"
    );
    if (!gallery)
      throw new ServerError("Something went wrong. Please try again");
    // Use an existing Customer ID if this is a returning customer.

    // Get current plam details to ascertain plan package

    const active_subscription = await Subscriptions.findOne(
      { "customer.gallery_id": gallery_id },
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

    const commission = Math.round(amount * commision_rate * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { ...meta, gallery_id },
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

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
