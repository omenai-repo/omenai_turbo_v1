import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { getApiUrl } from "@omenai/url-config/src/config";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    // Create Checkout Sessions from body params.
    const url = getApiUrl();
    await connectMongoDB();
    const { item, amount, gallery_id, meta, success_url, cancel_url } =
      await request.json();

    const gallery = await AccountGallery.findOne(
      { gallery_id },
      "connected_account_id"
    );
    const active_subscription = await Subscriptions.findOne(
      { "customer.gallery_id": gallery_id },
      "plan_details status"
    );

    if (!active_subscription || active_subscription.status !== "active")
      throw new ForbiddenError("No active subscription for this user");

    const commision_rate =
      active_subscription.plan_details.type.toLowerCase() === "premium"
        ? 0.15
        : active_subscription.plan_details.type.toLowerCase() === "pro"
          ? 0.2
          : 0.25;
    const commission = Math.round(amount * commision_rate * 100);
    const currentTimestampSeconds = Math.floor(Date.now() / 1000);
    const thirtyMinutesOffset = 30 * 60;
    const futureTimestamp = currentTimestampSeconds + thirtyMinutesOffset;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: item,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { ...meta, gallery_id },
      payment_intent_data: {
        application_fee_amount: commission,
        transfer_data: {
          destination: gallery.connected_account_id,
        },
      },
      expires_at: futureTimestamp,
      mode: "payment",
      success_url,
      cancel_url,
    });
    if (!session) throw new ServerError("Something went wrong, try again");
    return NextResponse.json({
      message: "Checkout Session created... Redirecting",
      url: session.url,
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
