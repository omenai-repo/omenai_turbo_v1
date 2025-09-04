import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

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

    // TODO: Send email to all emails telling them their card is unable to be charged.

    return NextResponse.json({
      message: "Subscription cancellation successful",
      canceledCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[subscription-cancellation] Error:", error);
    return NextResponse.json(
      {
        message: "Subscription cancellation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
