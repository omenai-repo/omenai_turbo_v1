import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const { data, gallery_id, action } = await request.json();

      const current_plan = await Subscriptions.findOne(
        {
          "customer.gallery_id": gallery_id,
        },
        "status"
      );

      const updateFuturePlan = await Subscriptions.updateOne(
        { "customer.gallery_id": gallery_id },
        {
          $set: {
            next_charge_params: data,
            status: action === "reactivation" ? "active" : current_plan.status,
          },
        }
      );

      if (!updateFuturePlan)
        throw new ServerError("Something went wrong, contact tech team");

      return NextResponse.json(
        { message: "Successfull", data: updateFuturePlan },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      console.log(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
