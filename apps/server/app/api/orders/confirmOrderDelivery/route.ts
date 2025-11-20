import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { SendBuyerShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendBuyerShipmentSuccessEmail";
import { SendArtistShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendArtistShipmentSuccessEmail";
import { SendGalleryShipmentSuccessEmail } from "@omenai/shared-emails/src/models/shipment/SendGalleryShipmentSuccessEmail";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { confirm_delivery, order_id } = await request.json();

    const updateOrders = await CreateOrder.updateOne(
      { order_id },
      { $set: { "shipping_details.delivery_confirmed": confirm_delivery } }
    );

    const order = await CreateOrder.findOne({ order_id });
    if (!order) {
      throw new ServerError(
        "Cannot find order with provided orderID. Please try again"
      );
    }

    if (!updateOrders)
      throw new ServerError(
        "Delivery confirmation could not be updated. Please try again"
      );

    // TODO: Send mail to buyer and seller about the order delivery confirmation
    await SendBuyerShipmentSuccessEmail({
      email: order.buyer_details.email,
      name: order.buyer_details.name,
      trackingCode: order_id,
    });

    if (order.seller_designation === "artist") {
      await SendArtistShipmentSuccessEmail({
        email: order.seller_details.email,
        name: order.seller_details.name,
        trackingCode: order_id,
      });
    } else {
      await SendGalleryShipmentSuccessEmail({
        email: order.seller_details.email,
        name: order.seller_details.name,
        trackingCode: order_id,
      });
    }

    return NextResponse.json(
      {
        message: "Successfully confirmed order delivery.",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: confirm order delivery",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
