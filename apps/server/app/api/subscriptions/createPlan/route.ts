import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
};

export const POST = withRateLimit(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const data = await request.json();

    const createPlan = await SubscriptionPlan.create({ ...data });

    if (!createPlan)
      throw new ServerError(
        "Something went wrong with creating this plan. Please contact support"
      );

    return NextResponse.json({ message: "Plan created successfully" });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: create plan",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
