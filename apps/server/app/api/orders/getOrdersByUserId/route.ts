import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { id } = await request.json();

      const orders = await CreateOrder.find({ "buyer_details.id": id })
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      if (!orders) throw new ServerError("No orders were found");

      return NextResponse.json(
        {
          message: "Successful",
          data: orders,
        },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "order: get order by user id",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
