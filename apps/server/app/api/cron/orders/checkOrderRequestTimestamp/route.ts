import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import OrderDeclinedEmail from "@omenai/shared-emails/src/views/order/OrderDeclinedEmail";
import OrderAutoDeclined from "@omenai/shared-emails/src/views/order/OrderAutoDeclined";
import OrderRequestReminder from "@omenai/shared-emails/src/views/order/OrderRequessstReminder";
import OrderDeclinedWarning from "@omenai/shared-emails/src/views/order/OrderDeclinedWarning";
const resend = new Resend("re_cB7pHY8M_7EDLfsuAKN6iY3RzQ19SwfSg");

export async function GET() {
  try {
    await connectMongoDB();

    const currentDate = new Date();

    // Check for orders older than 96 hours with empty order_accepted.status
    const orders96 = await CreateOrder.find({
      updatedAt: {
        $lt: new Date(currentDate.getTime() - 96 * 60 * 60 * 1000),
      },
      "order_accepted.status": "", // Ensure status is empty
    });
    if (orders96.length > 0) {
      // Update status to declined
      await CreateOrder.updateMany(
        {
          updatedAt: {
            $lt: new Date(currentDate.getTime() - 96 * 60 * 60 * 1000),
          },
          "order_accepted.status": "",
        },
        {
          $set: {
            "order_accepted.status": "declined",
            "order_accepted.reason":
              "Gallery did not respond within the designated timeframe",
          },
        }
      );

      const buyer_email_payload = orders96.map((order) => {
        return {
          from: "Orders <omenai@omenai.app>",
          to: [order.buyer.email],
          subject: "Your order has been declined",
          react: OrderDeclinedEmail(
            order.buyer.name,
            "Gallery did not respond within the designated timeframe",
            order.artwork_data
          ),
        };
      });
      await resend.batch.send(buyer_email_payload);

      const gallery_email_payload = orders96.map((gallery) => {
        return {
          from: "Orders <omenai@omenai.app>",
          to: [gallery.gallery_details.email],
          subject: "Order has been auto declined",
          react: OrderAutoDeclined(
            gallery.gallery_details.name,
            gallery.artwork_data
          ),
        };
      });

      await resend.batch.send(gallery_email_payload);
    }

    // Check for orders older than 72 hours with empty order_accepted.status
    const orders72 = await CreateOrder.find({
      updatedAt: {
        $lte: new Date(currentDate.getTime() - 72 * 60 * 60 * 1000),
        $gte: new Date(currentDate.getTime() - 96 * 60 * 60 * 1000),
      }, // Ensure not overlapping with 96-hour orders
      "order_accepted.status": "", // Ensure status is empty
    });
    if (orders72.length > 0) {
      // Send warning emails to galleries
      const email_payload = orders72.map((order) => {
        return {
          from: "Orders <omenai@omenai.app>",
          to: [order.gallery_details.email],
          subject: "Notice: Potential Order Request Decline",
          react: OrderDeclinedWarning(order.gallery_details.name),
        };
      });

      await resend.batch.send(email_payload);
    }

    // Check for orders older than 24 hours with empty order_accepted.status
    const orders24 = await CreateOrder.find({
      updatedAt: {
        $lt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),

        $gte: new Date(currentDate.getTime() - 72 * 60 * 60 * 1000),
      }, // Ensure not overlapping with 72-hour orders
      "order_accepted.status": "", // Ensure status is empty
    });
    if (orders24.length > 0) {
      const email_payload = orders24.map((order) => {
        return {
          from: "Orders <omenai@omenai.app>",
          to: [order.gallery_details.email],
          subject: "Order Request reminder",
          react: OrderRequestReminder(order.gallery_details.name),
        };
      });

      await resend.batch.send(email_payload);
    }

    return NextResponse.json({ message: "Successful" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { mesgae: "Something went wrong" },
      { status: 500 }
    );
  }
}
