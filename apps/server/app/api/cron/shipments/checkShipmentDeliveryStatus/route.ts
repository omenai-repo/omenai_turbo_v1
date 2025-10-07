import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

export const GET = withAppRouterHighlight(async function GET(request: Request) {
  try {
    await connectMongoDB();

    // Step 1: Fetch processing orders with valid shipment IDs and "In Transit" status

    const inTransitShipments = await CreateOrder.find(
      {
        status: "processing",
        "shipping_details.shipment_information.tracking.id": {
          $exists: true,
          $ne: null,
        },
        "shipping_details.shipment_information.tracking.status": "In Transit",
      },
      "order_id shipping_details.shipment_information.tracking.id"
    ).lean();

    return NextResponse.json({ message: "Cron is running" }, { status: 200 });
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
});
