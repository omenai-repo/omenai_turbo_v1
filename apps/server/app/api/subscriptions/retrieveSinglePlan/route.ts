import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { plan_id } = await request.json();
    const plan = await SubscriptionPlan.findOne({ plan_id });

    if (!plan) throw new ServerError("Something went wrong, contact tech team");

    return NextResponse.json(
      { message: "Successfull", data: plan },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
