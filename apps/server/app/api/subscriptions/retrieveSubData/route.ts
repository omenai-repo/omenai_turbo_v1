import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import {
  CombinedConfig,
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import z from "zod";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
const RetrieveSubDataSchema = z.object({
  gallery_id: z.string(),
});
export const POST = withRateLimit(config)(async function POST(
  request: Request,
) {
  try {
    const { gallery_id } = await validateRequestBody(
      request,
      RetrieveSubDataSchema,
    );
    await connectMongoDB();
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
        { status: 200 },
      );
    }

    const planType = subscription_data.plan_details?.type;
    // Local filter on the set of plans returned by find()
    const matchedPlan = Array.isArray(allPlans)
      ? ((allPlans as SubscriptionPlanDataTypes[]).find(
          (plan) => plan.name === planType,
        ) ?? null)
      : null;

    return NextResponse.json(
      {
        message: "Successfully retrieved subscription data",
        data: subscription_data,
        plan: matchedPlan,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: retrieve sub data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
