import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
export const revalidate = 0;
export const dynamic = "force-dynamic";

// NOTE: Run every hour
export const GET = withRateLimitAndHighlight(lenientRateLimit)(
  async function GET() {
    await connectMongoDB();

    try {
      // Strt session transaction

      // Get current date
      const currentDate = new Date();

      // find all subscriptions that are past their expiry date and set their status to expired, ignore canceled subscriptions
      await Subscriptions.updateMany(
        {
          expiry_date: { $lte: currentDate },
          status: { $ne: "cancelled" },
        },
        { $set: { status: "expired" } }
      );

      // Find all users with
      const expired_user_emails = await Subscriptions.find(
        {
          expiry_date: { $lte: currentDate },
          status: "expired",
        },
        "customer card next_charge_params"
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
        const tx_ref = generateAlphaDigit(7);
        return {
          token: doc.card.token,
          email: doc.customer.email,
          currency: "USD",
          fullname: doc.customer.name,
          country: doc.card.country.slice(-2),
          amount: doc.next_charge_params.value.toString(),
          tx_ref: `${tx_ref}&${doc.customer.gallery_id}&${
            doc.next_charge_params.id
          }&${doc.next_charge_params.interval}&${null}`,
        };
      });

      const response = await fetch(
        "https://api.flutterwave.com/v3/bulk-tokenized-charges",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Expired subscription reactivation charge",
            retry_strategy: {
              retry_interval: 120,
              retry_amount_variable: 100,
              retry_attempt_variable: 3,
              last_retry_attempt: 4,
            },
            bulk_data: user_token_data,
          }),
        }
      );

      const result = await response.json();

      return NextResponse.json(
        {
          message: "This cron job ran at it's designated time",
          data: result,
          token: user_token_data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.log("An error occurred during the transaction:" + error);

      // If any errors are encountered, abort the transaction process, this rolls back all updates and ensures that the DB isn't written to.
      // Exit the webhook
      return NextResponse.json({ status: 500 });
    }
  }
);
