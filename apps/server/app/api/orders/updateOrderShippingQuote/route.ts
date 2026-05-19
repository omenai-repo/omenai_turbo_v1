import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig } from "@omenai/shared-types";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { sendOrderAcceptedMail } from "@omenai/shared-emails/src/models/orders/orderAcceptedMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  generateArtworkDeeplink,
  generatePaymentDeeplink,
} from "@omenai/shared-lib/deeplink/config";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

const UpdateOrderShippingQuoteSchema = z.object({
  order_id: z.string().min(1),
  quote_data: z.string().min(1),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();
    const { order_id, quote_data } = await validateRequestBody(
      request,
      UpdateOrderShippingQuoteSchema,
    );

    const order = await CreateOrder.findOneAndUpdate(
      { order_id },
      { $set: { quote_data } },
      { new: true },
    );

    if (!order) throw new ServerError("Order data could not be updated");

    const paymentUrl = generatePaymentDeeplink(order.order_id, order.buyer_details.id);
    const artworkUrl = generateArtworkDeeplink(order.artwork_data?.art_id ?? "");

    await sendOrderAcceptedMail({
      name: order.buyer_details.name,
      email: order.buyer_details.email,
      paymentUrl,
      artworkUrl,
      artwork_data: order.artwork_data,
    });

    return NextResponse.json(
      { message: "Successfully updated quote data" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: update shipping quote",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
