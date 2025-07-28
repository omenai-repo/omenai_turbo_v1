import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";

// NOTE: Run every hour
export const GET = withRateLimit(lenientRateLimit)(
  async function GET(): Promise<Response> {
    try {
      await connectMongoDB();

      const today = new Date();

      const results = await Subscriptions.aggregate([
        {
          $match: {
            $expr: {
              $in: [
                {
                  $dateDiff: {
                    startDate: today,
                    endDate: "$expiry_date",
                    unit: "day",
                  },
                },
                [3, 2, 1],
              ],
            },
          },
        },
        {
          $project: {
            "customer.email": 1, // Include userId
          },
        },
      ]);

      // todo: Send reminder mail to users

      return NextResponse.json({ data: results, mesage: "Success" });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
