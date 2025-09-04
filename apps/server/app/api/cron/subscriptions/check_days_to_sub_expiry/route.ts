import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// NOTE: Run every hour - sends reminders to users whose subscriptions expire in 3, 2, or 1 days
export const GET = withRateLimit(lenientRateLimit)(
  async function GET(): Promise<Response> {
    try {
      await connectMongoDB();

      const today = new Date();

      const results = await Subscriptions.aggregate([
        {
          $match: {
            status: "active", // Only send reminders for active subscriptions
            $expr: {
              $in: [
                {
                  $dateDiff: {
                    startDate: today,
                    endDate: "$expiry_date",
                    unit: "day",
                  },
                },
                [3, 2, 1], // 3, 2, or 1 days until expiry
              ],
            },
          },
        },
        {
          $project: {
            "customer.email": 1,
            "customer.name": 1,
            "customer.gallery_id": 1,
            expiry_date: 1,
            plan_details: 1,
            // Calculate days until expiry for email customization
            days_until_expiry: {
              $dateDiff: {
                startDate: today,
                endDate: "$expiry_date",
                unit: "day",
              },
            },
          },
        },
      ]);

      // TODO: Send reminder email to users based on days_until_expiry
      // - Day 3: "Your subscription expires in 3 days"
      // - Day 2: "Your subscription expires in 2 days"
      // - Day 1: "Your subscription expires tomorrow"

      return NextResponse.json({
        message: "Subscription reminders processed successfully",
        remindersToSend: results.length,
        data: results,
      });
    } catch (error) {
      console.error("[subscription-reminders] Error:", error);
      return NextResponse.json(
        {
          message: "Subscription reminder processing failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
