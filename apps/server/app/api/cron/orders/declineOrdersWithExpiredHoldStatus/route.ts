import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { sendOrderDeclinedMail } from "@omenai/shared-emails/src/models/orders/orderDeclinedMail";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { createErrorRollbarReport } from "../../../util";

// NOTE: Run every 5 minutes
export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  try {
    await connectMongoDB();
    const nowUTC = toUTCDate(new Date());

    // Fetch orders on hold and not already declined
    const ordersOnHold: (CreateOrderModelTypes & {
      createdAt: string;
      updatedAt: string;
    })[] = await CreateOrder.find({
      hold_status: { $ne: null },
      "order_accepted.status": { $ne: "declined" },
    });

    if (!ordersOnHold.length) {
      return NextResponse.json(
        { message: "No held orders found." },
        { status: 200 }
      );
    }

    // Prepare bulk operations for expired holds
    const bulkOps: any[] = [];
    const ordersToEmail: typeof ordersOnHold = [];

    for (const order of ordersOnHold) {
      const holdEndUTC = toUTCDate(new Date(order.hold_status.hold_end_date));
      if (nowUTC >= holdEndUTC) {
        bulkOps.push({
          updateOne: {
            filter: {
              order_id: order.order_id,
              "order_accepted.status": { $ne: "declined" }, // idempotency
            },
            update: {
              $set: {
                "order_accepted.status": "declined",
                "order_accepted.reason":
                  "The payment period for this artwork has expired.",
                status: "completed",
              },
            },
          },
        });
        ordersToEmail.push(order);
      }
    }

    if (!bulkOps.length) {
      return NextResponse.json(
        { message: "No expired holds to process." },
        { status: 200 }
      );
    }

    // Bulk update
    const bulkResult = await CreateOrder.bulkWrite(bulkOps);
    const updatedCount = bulkResult.modifiedCount;

    // Fetch updated orders to confirm and send emails
    const updatedOrderIds = ordersToEmail.map((o) => o.order_id);
    const updatedOrders = await CreateOrder.find({
      order_id: { $in: updatedOrderIds },
      "order_accepted.status": "declined",
    });

    await Promise.allSettled(
      updatedOrders.map(async (order) => {
        try {
          await sendOrderDeclinedMail({
            name: order.buyer_details.name,
            email: order.buyer_details.email,
            reason: "The payment period for this artwork has expired.",
            artwork_data: order.artwork_data,
          });
          console.log(
            `✅ Order ${order.order_id} marked as declined and email sent.`
          );
        } catch (mailErr) {
          createErrorRollbarReport(
            "Cron: Decline orders with expired hold status - send decline email",
            mailErr as any,
            500
          );
          console.error(
            `❌ Failed to send decline email for order ${order.order_id}:`,
            mailErr
          );
        }
      })
    );

    console.log(
      `Checked ${ordersOnHold.length} orders. ${updatedCount} updated.`
    );
    return NextResponse.json(
      {
        message: `Checked ${ordersOnHold.length} orders. ${updatedCount} updated.`,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Cron: Decline orders with expired hold status",
      error as any,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
