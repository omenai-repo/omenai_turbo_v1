import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";
const GetOrderByFilterSchema = z.object({
  id: z.string(),
});
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const idParams = searchParams.get("id");
    const { id } = validateGetRouteParams(GetOrderByFilterSchema, {
      id: idParams,
    });
    const orders = await CreateOrder.find({
      "seller_details.id": id,
      "order_accepted.status": "",
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    if (!orders)
      return NextResponse.json(
        { message: "No orders were found matching this filter", data: [] },
        { status: 200 },
      );

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
      "order: get order by filter",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
