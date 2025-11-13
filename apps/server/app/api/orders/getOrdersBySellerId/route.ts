import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  try {
    await connectMongoDB();

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
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
