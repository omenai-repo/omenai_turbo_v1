import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { createErrorRollbarReport } from "../../util";

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const searchParam = new URL(request.url).searchParams;
  const plan_id = searchParam.get("plan_id");

  try {
    if (!plan_id) throw new BadRequestError("No plan id provided");
    await connectMongoDB();
    const plan = await SubscriptionPlan.findOne({ plan_id }).lean();

    if (!plan) throw new ServerError("Something went wrong, contact tech team");

    return NextResponse.json(
      { message: "Successfull", data: plan },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    createErrorRollbarReport(
      "subscription: retrieve single plan",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
