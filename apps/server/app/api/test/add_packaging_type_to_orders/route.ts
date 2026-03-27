import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function GET() {
  try {
    await connectMongoDB();

    const updateOrders = await CreateOrder.updateMany(
      {
        "artwork_data.packaging_type": { $exists: false },
      },
      {
        $set: {
          "artwork_data.packaging_type": "rolled",
        },
      },
    );

    console.log(updateOrders.modifiedCount);

    return NextResponse.json({ count: updateOrders.modifiedCount });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json({ error_response });
  }
}
