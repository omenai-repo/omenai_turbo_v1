import {
  lenientRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
export const revalidate = 0;
export const dynamic = "force-dynamic";

// NOTE: Run every hour
export const GET = withRateLimitAndHighlight(lenientRateLimit)(
  async function GET() {
    await connectMongoDB();
    // Calculate the date that is three days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    await Subscriptions.updateMany(
      { sub_expiry_date: { $lt: threeDaysAgo } },
      { $set: { sub_status: "cancelled " } }
    );
    // TODO: Send email to all emails telling them their card is unable to be charged.

    return NextResponse.json({ message: "Successful" });
  }
);
