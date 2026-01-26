import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { createErrorRollbarReport } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const searchParam = new URL(request.url).searchParams;
  const plan_id = searchParam.get("plan_id");

  try {
    if (!plan_id) throw new BadRequestError("No plan id provided");
    await connectMongoDB();
    const plan = await SubscriptionPlan.findOne({ plan_id }).lean();

    if (!plan) throw new ServerError("Something went wrong, contact tech team");

    return NextResponse.json(
      { message: "Successfull", data: plan },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: retrieve single plan",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
