import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimit(lenientRateLimit)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { order_id } = await request.json();

    const lock_status = await CreateOrder.findOne(
      { order_id },
      "lock_purchase artwork_data"
    );

    if (!lock_status)
      throw new NotFoundError("No order matching this id found");

    return NextResponse.json(
      {
        message: "Successful",
        data: lock_status,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: retrieve order lock status",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
