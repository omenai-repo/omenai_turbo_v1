import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { SubscriptionPlan } from "@omenai/shared-models/models/subscriptions/PlanSchema";
export async function POST(request: Request) {
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
    console.log(error);
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
