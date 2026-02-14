import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";
const UpdateOrderTrackingSchema = z.object({
  data: z.any(),
  order_id: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { data, order_id } = await validateRequestBody(
        request,
        UpdateOrderTrackingSchema,
      );

      const updateOrders = await CreateOrder.findOneAndUpdate(
        { order_id },
        { $set: { "shipping_details.shipment_information.tracking": data } },
      );

      if (!updateOrders)
        throw new ServerError("Tracking data could not be updated");

      return NextResponse.json(
        {
          message: "Successfully updated tracking information",
        },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "order: update order tracking data",
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
