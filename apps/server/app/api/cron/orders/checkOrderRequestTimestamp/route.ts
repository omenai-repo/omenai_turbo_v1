import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import OrderDeclinedEmail from "@omenai/shared-emails/src/views/order/OrderDeclinedEmail";
import OrderAutoDeclined from "@omenai/shared-emails/src/views/order/OrderAutoDeclined";
import OrderRequestReminder from "@omenai/shared-emails/src/views/order/OrderRequessstReminder";
import OrderDeclinedWarning from "@omenai/shared-emails/src/views/order/OrderDeclinedWarning";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: Run every day at 00:00 UTC
export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  try {
    await connectMongoDB();

    const currentDate = toUTCDate(new Date());
    const hours24Ago = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const hours72Ago = new Date(currentDate.getTime() - 72 * 60 * 60 * 1000);
    const hours96Ago = new Date(currentDate.getTime() - 96 * 60 * 60 * 1000);

    let processedCounts = {
      autoDeclined: 0,
      warningsSent: 0,
      remindersSent: 0,
    };

    // 1. Auto-decline orders older than 96 hours
    const orders96 = await CreateOrder.find({
      updatedAt: { $lt: hours96Ago },
      "order_accepted.status": "",
    });

    if (orders96.length > 0) {
      // Update status to declined atomically
      const updateResult = await CreateOrder.updateMany(
        {
          updatedAt: { $lt: hours96Ago },
          "order_accepted.status": "", // Ensure they're still pending
        },
        {
          $set: {
            "order_accepted.status": "declined",
            "order_accepted.reason":
              "Seller did not respond within the designated timeframe",
          },
        }
      );

      processedCounts.autoDeclined = updateResult.modifiedCount;

      // Only send emails for successfully updated orders
      if (updateResult.modifiedCount > 0) {
        const ordersToEmail = orders96.slice(0, updateResult.modifiedCount);

        // Send emails to buyers
        const buyerEmailPayload = ordersToEmail.map((order) => ({
          from: "Orders <omenai@omenai.app>",
          to: [order.buyer_details.email],
          subject: "Your order has been declined",
          react: OrderDeclinedEmail({
            recipientName: order.buyer_details.name,
            declineReason:
              "Seller did not respond within the designated timeframe",
            artwork: order.artwork_data,
          }),
        }));

        // Send emails to sellers
        const sellerEmailPayload = ordersToEmail.map((order) => ({
          from: "Orders <omenai@omenai.app>",
          to: [order.seller_details.email],
          subject: "Order has been auto declined",
          react: OrderAutoDeclined(
            order.seller_details.name,
            order.artwork_data
          ),
        }));

        try {
          await Promise.all([
            resend.batch.send(buyerEmailPayload),
            resend.batch.send(sellerEmailPayload),
          ]);
        } catch (emailError) {
          console.error("Failed to send auto-decline emails:", emailError);
          // Continue processing - don't fail the whole job for email issues
        }
      }
    }

    // 2. Send warnings for orders 72-96 hours old
    const orders72 = await CreateOrder.find({
      updatedAt: {
        $lt: hours72Ago,
        $gte: hours96Ago, // Between 72 and 96 hours
      },
      "order_accepted.status": "",
    });

    if (orders72.length > 0) {
      const warningEmailPayload = orders72.map((order) => ({
        from: "Orders <omenai@omenai.app>",
        to: [order.seller_details.email],
        subject: "Notice: Potential Order Request Decline",
        react: OrderDeclinedWarning(order.seller_details.name),
      }));

      try {
        await resend.batch.send(warningEmailPayload);
        processedCounts.warningsSent = orders72.length;
      } catch (emailError) {
        console.error("Failed to send warning emails:", emailError);
      }
    }

    // 3. Send reminders for orders 24-72 hours old
    const orders24 = await CreateOrder.find({
      updatedAt: {
        $lt: hours24Ago,
        $gte: hours72Ago, // Between 24 and 72 hours
      },
      "order_accepted.status": "",
    });

    if (orders24.length > 0) {
      const reminderEmailPayload = orders24.map((order) => ({
        from: "Orders <omenai@omenai.app>",
        to: [order.seller_details.email],
        subject: "Order Request reminder",
        react: OrderRequestReminder(order.seller_details.name),
      }));

      try {
        await resend.batch.send(reminderEmailPayload);
        processedCounts.remindersSent = orders24.length;
      } catch (emailError) {
        console.error("Failed to send reminder emails:", emailError);
      }
    }

    console.log("Order management completed:", processedCounts);

    return NextResponse.json(
      {
        message: "Order management completed successfully",
        ...processedCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order management cron failed:", error);
    return NextResponse.json(
      { message: "Something went wrong" }, // Fixed typo
      { status: 500 }
    );
  }
});
