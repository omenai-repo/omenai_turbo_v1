import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendOrderAcceptedMail } from "@omenai/shared-emails/src/models/orders/orderAcceptedMail";
export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { data, order_id } = await request.json();

    const updateOrders = await CreateOrder.findOneAndUpdate(
      { order_id },
      {
        $set: {
          "shipping_details.quote": data,
          order_accepted: { status: "accepted", reason: "" },
        },
      },
      { new: true }
    );

    if (!updateOrders) throw new ServerError("Quote could not be updated");

    await sendOrderAcceptedMail({
      name: updateOrders.buyer_details.name,
      email: updateOrders.buyer_details.email,
      order_id: updateOrders.order_id,
      user_id: updateOrders.buyer_details.id,
      artwork_data: updateOrders.artwork_data,
    });

    return NextResponse.json(
      {
        message: "Successfully updated quote data",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
