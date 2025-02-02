import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendOrderDeclinedMail } from "@omenai/shared-emails/src/models/orders/orderDeclinedMail";
export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { data, order_id } = await request.json();

    const declineOrder = await CreateOrder.findOneAndUpdate(
      { order_id },
      {
        $set: {
          order_accepted: { status: data.status, reason: data.reason },
          status: "completed",
        },
      },
      { new: true }
    );

    if (!declineOrder) throw new ServerError("An error occured");

    await sendOrderDeclinedMail({
      name: declineOrder.buyer_details.name,
      email: declineOrder.buyer_details.email,
      reason: declineOrder.order_accepted.reason,
      artwork_data: declineOrder.artwork_data,
    });

    return NextResponse.json(
      {
        message: "Successfully declined order",
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
