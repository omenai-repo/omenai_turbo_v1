import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { redis } from "@omenai/upstash-config";
import { createErrorRollbarReport } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const GET = withRateLimit(standardRateLimit)(async function GET() {
  try {
    await connectMongoDB();

    const cacheKey = "plans";

    try {
      const stringedPlans = await redis.get(cacheKey);

      if (!stringedPlans) {
        const plans = await fetchAndSetCache();

        return NextResponse.json({
          data: plans,
          message: "Plans retrieved successfully",
        });
      }

      const planData =
        typeof stringedPlans === "string"
          ? JSON.parse(stringedPlans)
          : stringedPlans;

      return NextResponse.json({
        data: planData,
        message: "Plans retrieved successfully",
      });
    } catch (error) {
      const plans = await fetchAndSetCache();

      return NextResponse.json({
        data: plans,
        message: "Plans retrieved successfully",
      });
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: retrieve plans",
      error,
      error_response.status
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});

async function fetchAndSetCache() {
  const dbPlans = await SubscriptionPlan.find().lean();

  if (!dbPlans) throw new NotFoundError("No plans stored");
  try {
    await redis.set("plans", dbPlans, { ex: 86400 });
  } catch (redisWriteErr) {
    console.error(`Redis Write Error [plans:`, redisWriteErr);
    createErrorRollbarReport(
      "subscription: retrieve plans: Redis write Error",
      redisWriteErr as any,
      500
    );
  }

  return dbPlans;
}
