import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";

const GetOrderBySellerIdSchema = z.object({
  id: z.string(),
});
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idParams = searchParams.get("id");
  try {
    await connectMongoDB();
    const { id } = validateGetRouteParams(GetOrderBySellerIdSchema, {
      id: idParams,
    });
    const orders = await CreateOrder.find({ "seller_details.id": id })
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
      "order: get order by seller id",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
