import {
  lenientRateLimit,
  standardRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { SubscriptionExpireAlert } from "@omenai/shared-emails/src/views/subscription/SubscriptionExpireAlert";
import { createErrorRollbarReport } from "../../../util";
import { verifyAuthVercel } from "../../utils";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: Run every hour - sends reminders to users whose subscriptions expire in 3, 2, or 1 days
export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
): Promise<Response> {
  try {
    await verifyAuthVercel(request);

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

    const expiredSoonEmailPayload = await Promise.all(
      results.map(async (subscription) => {
        const html = await render(
          SubscriptionExpireAlert(
            subscription.customer.name,
            `${subscription.days_until_expiry > 1 ? `in ${subscription.days_until_expiry} days` : "tomorrow"}`,
          ),
        );
        return {
          from: "Subscription <omenai@omenai.app>",
          to: [subscription.customer.email],
          subject: `Your Subscription Expires ${subscription.days_until_expiry > 1 ? `in ${subscription.days_until_expiry} days` : "tomorrow"}`,
          html,
        };
      }),
    );

    await resend.batch.send(expiredSoonEmailPayload);

    return NextResponse.json({
      message: "Subscription reminders processed successfully",
      remindersToSend: results.length,
      data: results,
    });
  } catch (error) {
    console.error("[subscription-reminders] Error:", error);

    createErrorRollbarReport(
      "Cron: Check days to subscription expiry - send reminders",
      error,
      500,
    );
    return NextResponse.json(
      {
        message: "Subscription reminder processing failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
