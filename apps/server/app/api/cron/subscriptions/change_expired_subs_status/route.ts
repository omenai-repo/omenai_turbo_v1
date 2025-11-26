import SubscriptionPaymentFailedMail from "@omenai/shared-emails/src/views/subscription/SubscriptionPaymentFailedMail";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createErrorRollbarReport } from "../../../util";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: Run every hour - cancels subscriptions that have been expired for 3+ days
export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  try {
    await connectMongoDB();

    // Calculate the date that is three days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const result = await Subscriptions.updateMany(
      {
        expiry_date: { $lt: threeDaysAgo },
        status: "expired", // Only cancel expired subscriptions, not active ones
      },
      { $set: { status: "canceled" } }
    );
    const subscriptions = await Subscriptions.find({
      expiry_date: { $lt: threeDaysAgo },
    }).lean();

    // TODO: Send email to all emails telling them their card is unable to be charged.
    const expiredEmailPayload = await Promise.all(
      subscriptions.map(async (subscription) => {
        const html = await render(
          SubscriptionPaymentFailedMail(subscription.customer.name)
        );
        return {
          from: "Subscription <omenai@omenai.app>",
          to: [subscription.customer.email],
          subject: "Action Required: We were Unable to Process Your Payment",
          html,
        };
      })
    );
    await resend.batch.send(expiredEmailPayload);

    return NextResponse.json({
      message: "Subscription cancellation successful",
      canceledCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[subscription-cancellation] Error:", error);
    const error_response = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Cron: Change expired subscriptions status",
      error,
      error_response?.status
    );
    return NextResponse.json(
      {
        message: "Subscription cancellation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
