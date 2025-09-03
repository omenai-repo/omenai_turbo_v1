import { PaymentMethod } from "@stripe/stripe-js";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// NOTE: Run every hour
export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  await connectMongoDB();

  try {
    // Strt session transaction

    // Get current date
    const currentDate = new Date();

    // find all subscriptions that are past their expiry date and set their status to expired, ignore canceled subscriptions
    await Subscriptions.updateMany(
      {
        expiry_date: { $lte: currentDate },
        status: { $ne: "canceled" },
      },
      { $set: { status: "expired" } }
    );

    // Find all users with
    const expired_user_emails = await Subscriptions.find(
      {
        expiry_date: { $lte: currentDate },
        status: "expired",
      },
      "customer paymentMethod next_charge_params stripe_customer_id"
    );

    if (expired_user_emails.length === 0) {
      return NextResponse.json(
        { message: "No expired subscriptions" },
        { status: 200 }
      );
    }

    const emailsToUpdate = expired_user_emails.map((email) => {
      return email.customer.email;
    });

    // Iterate through the expired documents

    await AccountGallery.updateMany(
      { email: { $in: emailsToUpdate } },
      { $set: { subscription_status: { type: null, active: false } } }
    );

    const user_token_data = expired_user_emails.map((doc) => {
      return {
        email: doc.customer.email,
        currency: "USD",
        fullname: doc.customer.name,
        amount: doc.next_charge_params.value,
        stripe_customer_id: doc.stripe_customer_id,
        paymentMethod: doc.PaymentMethod,
        meta: {
          planId: doc.next_charge_params.id,
          planInterval: doc.next_charge_params.interval,
          gallery_id: doc.customer.gallery_id,
        },
      };
    });

    user_token_data.forEach((user) => {
      async () => {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(user.amount * 100),
          currency: "usd",
          customer: user.stripe_customer_id, // retrieved/stored earlier
          payment_method: user.paymentMethod.id,
          off_session: true, // important for stored cards
          confirm: true, // attempt charge immediately
          metadata: { ...user.meta, type: "subscription" },
        });
      };
    });

    return NextResponse.json(
      {
        message: "This cron job ran at it's designated time",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("An error occurred during the transaction:" + error);

    // If any errors are encountered, abort the transaction process, this rolls back all updates and ensures that the DB isn't written to.
    // Exit the webhook
    return NextResponse.json({ status: 500 });
  }
});
