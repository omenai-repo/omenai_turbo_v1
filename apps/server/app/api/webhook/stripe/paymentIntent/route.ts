import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { NextResponse } from "next/server";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { sendPaymentPendingMail } from "@omenai/shared-emails/src/models/payment/sendPaymentPendingMail";

import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  const secretHash = process.env.STRIPE_PAYMENT_INTENT_WEBHOOK_SECRET!;
  const rawBody = await request.text();

  let event;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (secretHash) {
    // Get the signature sent by Stripe
    const signature = request.headers.get("stripe-signature");
    try {
      event = await stripe.webhooks.constructEvent(
        rawBody,
        signature,
        secretHash
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err);
      return NextResponse.json({ status: 400 });
    }
  }

  const paymentIntent = event.data.object;
  const meta = paymentIntent.metadata;

  const client = await connectMongoDB();
  const order_info = await CreateOrder.findOne(
    {
      "buyer_details.email": meta.buyer_email,
      "artwork_data.art_id": meta.art_id,
    },
    "artwork_data order_id createdAt buyer_details"
  );

  if (event.type === "payment_intent.processing") {
    await sendPaymentPendingMail({
      email: meta.buyer_email,
      name: order_info.buyer_details.name,
      artwork: order_info.artwork_data.title,
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    await sendPaymentFailedMail({
      email: meta.buyer_email,
      name: order_info.buyer.name,
      artwork: order_info.artwork_data.title,
    });
  }

  if (event.type === "payment_intent.succeeded") {
    // Then define and call a method to handle the successful payment intent.
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ status: 400 });
    }

    let transaction_id;

    // Retrieve the MongoDB Client

    // Create a session with the initialized MongoClient
    const session = await client.startSession();

    const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
    const formatted_date = getFormattedDateTime();
    const date = toUTCDate(new Date());

    try {
      await CreateOrder.updateOne(
        { order_id: order_info.order_id },
        { $set: { hold_status: null } }
      );
      // Create a session transaction to group multiple database operations
      // A session transaction ensures that all operations are successful before it it being commited to the DB, if a single error occurs in any operation,
      // the updates are rolled back and the entire process is aborted.

      session.startTransaction();

      //   Update Order Payment Information

      // Create the update info
      const payment_information: PaymentStatusTypes = {
        status: "completed",
        transaction_value: formatPrice(
          paymentIntent.amount_received / 100,
          currency
        ),
        transaction_date: formatted_date,
        transaction_reference: paymentIntent.id,
      };

      // Apply update to CreateOrder collection
      await CreateOrder.updateOne(
        {
          "buyer_details.email": meta.buyer_email,
          "artwork_data.art_id": meta.art_id,
        },
        {
          $set: {
            payment_information,
          },
        }
      );

      // Update transaction collection
      const transaction_pricing: PurchaseTransactionPricing = {
        amount_total: Math.round(paymentIntent.amount_total / 100),
        unit_price: Math.round(+meta.unit_price),
        shipping_cost: Math.round(+meta.shipping_cost),
        commission: Math.round(+meta.commission),
        tax_fees: Math.round(+meta.tax_fees),
      };

      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_pricing: transaction_pricing,
        trans_date: date,
        trans_recipient_id: meta.seller_id,
        trans_initiator_id: meta.buyer_id,
        trans_recipient_role: "gallery",
        trans_reference: paymentIntent.id,
      };

      const create_transaction = await PurchaseTransactions.create(data);

      // Update Artwork Availability to false
      await Artworkuploads.updateOne(
        { art_id: meta.art_id },
        { $set: { availability: false } }
      );

      // Add this transaction to sales activity for revenue representation
      const { month, year } = getCurrentMonthAndYear();
      const activity = {
        month,
        year,
        value: meta.unit_price,
        id: meta.seller_id,
        trans_ref: data.trans_reference,
      };

      await SalesActivity.create({ ...activity });

      // Clear the order lock on the artwork
      await releaseOrderLock(meta.art_id, meta.buyer_id);

      await CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer_details.id": { $ne: meta.buyer_id },
        },
        { $set: { availability: false } }
      );

      transaction_id = create_transaction.trans_id;

      // Once all operations are run with no errors, commit the transaction
      await session.commitTransaction();
      const price = formatPrice(paymentIntent.amount_received / 100, currency);

      const buyer_push_token = await DeviceManagement.findOne(
        { auth_id: order_info.buyer_details.id },
        "device_push_token"
      );
      const seller_push_token = await DeviceManagement.findOne(
        { auth_id: order_info.seller_details.id },
        "device_push_token"
      );
      const notificationPromises = [];

      // Check for actual token value, not just document existence
      if (buyer_push_token?.device_push_token) {
        const buyer_notif_payload: NotificationPayload = {
          to: buyer_push_token.device_push_token, // Extract the actual token
          title: "Payment successful",
          body: `Your payment for ${order_info.artwork_data.title} has been confirmed`,
          data: {
            type: "orders",
            access_type: "collector",
            metadata: {
              orderId: order_info.order_id,
              date: toUTCDate(new Date()),
            },
            userId: order_info.buyer_details.id,
          },
        };

        notificationPromises.push(
          createWorkflow(
            "/api/workflows/notification/pushNotification",
            `notification_workflow_buyer_${order_info.order_id}_${generateDigit(2)}`,
            JSON.stringify(buyer_notif_payload)
          ).catch((error) => {
            console.error("Failed to send buyer notification:", error);
          })
        );
      }

      if (seller_push_token?.device_push_token) {
        const seller_notif_payload: NotificationPayload = {
          to: seller_push_token.device_push_token, // Extract the actual token
          title: "Payment received",
          body: `A payment of ${formatPrice(order_info.artwork_data.pricing.usd_price, "USD")} has been made for your artpiece`,
          data: {
            type: "orders",
            access_type: order_info.seller_designation as "artist",
            metadata: {
              orderId: order_info.order_id,
              date: toUTCDate(new Date()),
            },
            userId: order_info.seller_details.id,
          },
        };

        notificationPromises.push(
          createWorkflow(
            "/api/workflows/notification/pushNotification",
            `notification_workflow_seller_${order_info.order_id}_${generateDigit(2)}`,
            JSON.stringify(seller_notif_payload)
          ).catch((error) => {
            console.error("Failed to send seller notification:", error);
          })
        );
      }

      await Promise.all([
        createWorkflow(
          "/api/workflows/shipment/create_shipment",
          `create_shipment_${generateDigit(6)}`,
          JSON.stringify({ order_id: order_info.order_id })
        ),
        createWorkflow(
          "/api/workflows/emails/sendPaymentSuccessMail",
          `send_payment_success_mail${generateDigit(6)}`,
          JSON.stringify({
            buyer_email: order_info.buyer_details.email,
            buyer_name: order_info.buyer_details.name,
            artwork_title: order_info.artwork_data.title,
            order_id: order_info.order_id,
            order_date: order_info.createdAt,
            transaction_id: transaction_id,
            price,
            seller_email: order_info.seller_details.email,
            seller_name: order_info.seller_details.name,
          })
        ),
        ...notificationPromises,
      ]);

      console.log("Transaction committed.");
    } catch (error) {
      console.log("An error occurred during the transaction:" + error);

      // If any errors are encountered, abort the transaction process, this rolls back all updates and ensures that the DB isn't written to.
      await session.abortTransaction();
      // Exit the webhook
      return NextResponse.json({ status: 400 });
    } finally {
      // End the session to avoid reusing the same Mongoclient for different transactions
      await session.endSession();
    }

    // Catch error above
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ status: 200 });
});
