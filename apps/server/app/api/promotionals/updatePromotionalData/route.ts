import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PromotionalModel } from "@omenai/shared-models/models/promotionals/PromotionalSchema";
import { PromotionalDataUpdateTypes } from "@omenai/shared-types";
import { ObjectId } from "mongoose";
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
      const data: { id: ObjectId; updates: PromotionalDataUpdateTypes } =
        await request.json();

      const updatePromotionalData = await PromotionalModel.findByIdAndUpdate(
        data.id,
        { $set: data.updates }
      );

      if (!updatePromotionalData)
        throw new ServerError(
          "Something went wrong, please try again or contact support"
        );

      return NextResponse.json({ message: "Promotional data updated" });
    } catch (error) {
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
