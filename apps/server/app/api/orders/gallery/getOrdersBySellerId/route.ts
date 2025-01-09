import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { id } = await request.json();

    const orders = await CreateOrder.find({ "seller_details.id": id })
      .sort({ updatedAt: -1 })
      .exec();

    console.log(orders);

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
