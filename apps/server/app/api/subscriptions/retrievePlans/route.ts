import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const GET = withAppRouterHighlight(async function GET() {
  try {
    await connectMongoDB();

    const plans = await SubscriptionPlan.find();
    if (!plans)
      throw new ServerError("Something went wrong, contact tech team");

    return NextResponse.json({
      data: plans,
      message: "Plans retrieved successfully",
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
