import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  CombinedConfig,
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { gallery_id } = await request.json();
    if (!gallery_id) {
      return NextResponse.json(
        { message: "Missing gallery_id parameter" },
        { status: 400 }
      );
    }

    // Fetch subscription and ALL plans concurrently.
    const [subscription_data, allPlans] = await Promise.all([
      Subscriptions.findOne({
        "customer.gallery_id": gallery_id,
      }).lean() as Promise<SubscriptionModelSchemaTypes | null>,
      SubscriptionPlan.find().lean() as unknown as Promise<SubscriptionPlanDataTypes | null>,
    ]);

    if (!subscription_data) {
      return NextResponse.json(
        { message: "No subscription data found", data: null },
        { status: 200 }
      );
    }

    const planType = subscription_data.plan_details?.type;
    // Local filter on the set of plans returned by find()
    const matchedPlan = Array.isArray(allPlans)
      ? ((allPlans as SubscriptionPlanDataTypes[]).find(
          (plan) => plan.name === planType
        ) ?? null)
      : null;

    return NextResponse.json(
      {
        message: "Successfully retrieved subscription data",
        data: subscription_data,
        plan: matchedPlan,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
