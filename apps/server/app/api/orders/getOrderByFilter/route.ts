import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

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
        { status: 200 }
      );

    return NextResponse.json(
      {
        message: "Successful",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: get order by filter",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
