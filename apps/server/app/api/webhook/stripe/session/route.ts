import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NextResponse } from "next/server";
import { createErrorRollbarReport } from "../../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  // Validate webhook secret
  const secretHash = process.env.STRIPE_CHECKOUT_SESSION_WEBHOOK_SECRET;
  if (!secretHash) {
    console.error("Missing STRIPE_CHECKOUT_SESSION_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  let event;

  // Verify webhook signature
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }
    event = await stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secretHash
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err);
    createErrorRollbarReport(
      "Stripe Checkout Session webhook processing - Invalid webhook signature",
      err as any,
      500
    );
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object;

    // Validate payment status
    if (
      checkoutSession.status !== "complete" ||
      checkoutSession.payment_status !== "paid"
    ) {
      console.log("Checkout session not complete or not paid");
      return NextResponse.json({ status: 400 });
    }

    const meta = checkoutSession.metadata;
    if (!meta?.buyer_email || !meta?.art_id) {
      console.error("Missing required metadata");
      return NextResponse.json({ status: 400 });
    }

    // Idempotency check - do this BEFORE starting any transaction
    const existingTransaction = await PurchaseTransactions.findOne({
      trans_reference: checkoutSession.id,
    });

    if (existingTransaction) {
      console.log("Transaction already processed, skipping.");
      return NextResponse.json({ status: 200 });
    }

    // Fetch order information
    const order_info = await CreateOrder.findOne({
      "buyer_details.email": meta.buyer_email,
      "artwork_data.art_id": meta.art_id,
    });

    if (!order_info) {
      console.error(
        "Order not found for buyer email:",
        meta.buyer_email,
        "art_id:",
        meta.art_id
      );
      return NextResponse.json({ status: 404 });
    }

    // Prepare transaction data
    const currency = getCurrencySymbol(checkoutSession.currency.toUpperCase());
    const formatted_date = getFormattedDateTime();
    const date = toUTCDate(new Date());
    let transaction_id;

    // Connect to MongoDB and create a new session
    const client = await connectMongoDB();
    const session = await client.startSession();

    try {
      // Remove hold status BEFORE starting transaction (non-transactional)
      await CreateOrder.updateOne(
        { order_id: order_info.order_id },
        { $set: { hold_status: null } }
      );

      // Start the transaction
      session.startTransaction();

      // Prepare payment information
      const payment_information: PaymentStatusTypes = {
        status: "completed",
        transaction_value: checkoutSession.amount_total / 100,
        transaction_date: formatted_date,
        transaction_reference: checkoutSession.id,
      };

      // Update order with payment information
      await CreateOrder.updateOne(
        {
          "buyer_details.email": meta.buyer_email,
          "artwork_data.art_id": meta.art_id,
        },
        {
          $set: {
            payment_information,
          },
        },
        { session }
      );

      // Prepare transaction pricing
      const transaction_pricing: PurchaseTransactionPricing = {
        amount_total: Math.round(checkoutSession.amount_total / 100),
        unit_price: Math.round(+meta.unit_price),
        shipping_cost: Math.round(+meta.shipping_cost),
        commission: Math.round(+meta.commission),
        tax_fees: Math.round(+meta.tax_fees),
        currency: "USD",
      };

      // Create transaction record
      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_pricing: transaction_pricing,
        trans_date: date,
        trans_recipient_id: meta.seller_id,
        trans_initiator_id: meta.buyer_id,
        trans_recipient_role: "gallery",
        trans_reference: checkoutSession.id,
        status: "successful", // Use a consistent status
      };

      const create_transaction = await PurchaseTransactions.create([data], {
        session,
      });
      transaction_id = create_transaction[0].trans_id;

      // Update artwork availability
      await Artworkuploads.updateOne(
        { art_id: meta.art_id },
        { $set: { availability: false } },
        { session }
      );

      // Record sales activity
      const { month, year } = getCurrentMonthAndYear();
      const activity = {
        month,
        year,
        value: meta.unit_price,
        id: meta.seller_id,
        trans_ref: data.trans_reference,
      };

      await SalesActivity.create([activity], { session });

      // Update other orders for the same artwork
      await CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer_details.id": { $ne: meta.buyer_id },
        },
        { $set: { availability: false } },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      console.log("Transaction committed successfully.");

      // === Post-transaction operations (outside of transaction) ===

      // Release order lock
      await releaseOrderLock(meta.art_id, meta.buyer_id);

      const price = formatPrice(checkoutSession.amount_total / 100, currency);

      // Fetch push tokens for notifications
      const [buyer_push_token, seller_push_token] = await Promise.all([
        DeviceManagement.findOne(
          { auth_id: order_info.buyer_details.id },
          "device_push_token"
        ),
        DeviceManagement.findOne(
          { auth_id: order_info.seller_details.id },
          "device_push_token"
        ),
      ]);

      const notificationPromises = [];

      // Prepare buyer notification if token exists
      if (buyer_push_token?.device_push_token) {
        const buyer_notif_payload: NotificationPayload = {
          to: buyer_push_token.device_push_token,
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
            createErrorRollbarReport(
              "Stripe Checkout Session webhook processing - Failed to send buyer notification",
              error as any,
              500
            );
            console.error("Failed to send buyer notification:", error);
          })
        );
      }

      // Prepare seller notification if token exists
      if (seller_push_token?.device_push_token) {
        const seller_notif_payload: NotificationPayload = {
          to: seller_push_token.device_push_token,
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
            createErrorRollbarReport(
              "Stripe Checkout Session webhook processing - Failed to send seller notification",
              error as any,
              500
            );
            console.error("Failed to send seller notification:", error);
          })
        );
      }

      // Execute all post-transaction workflows
      await Promise.all([
        createWorkflow(
          "/api/workflows/shipment/create_shipment",
          `create_shipment_${generateDigit(6)}`,
          JSON.stringify({ order_id: order_info.order_id })
        ).catch((error) => {
          createErrorRollbarReport(
            "Stripe Checkout Session webhook processing - Failed to create shipment workflow",
            error as any,
            500
          );
          console.error("Failed to create shipment workflow:", error);
        }),
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
        ).catch((error) => {
          createErrorRollbarReport(
            "Stripe Checkout Session webhook processing - Failed to send payment success mail workflow",
            error as any,
            500
          );
          console.error("Failed to send payment success mail workflow:", error);
        }),
        ...notificationPromises,
      ]);

      return NextResponse.json({ status: 200 });
    } catch (error) {
      createErrorRollbarReport(
        "Stripe Checkout Session webhook processing ",
        error as any,
        500
      );
      console.error("An error occurred during the transaction:", error);

      // Only abort if transaction is still in progress
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
          console.log("Transaction aborted.");
        } catch (abortError) {
          createErrorRollbarReport(
            "Stripe Checkout Session webhook processing - Failed to abort MongoDB transaction",
            abortError as any,
            500
          );
          console.error("Failed to abort transaction:", abortError);
        }
      }

      return NextResponse.json({ status: 500 });
    } finally {
      // Always end the session to prevent connection leaks
      await session.endSession();
    }
  }

  // Handle checkout.session.expired event
  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object;
    const meta = checkoutSession.metadata;

    if (meta?.art_id && meta?.buyer_id) {
      try {
        await releaseOrderLock(meta.art_id, meta.buyer_id);
        console.log(
          `Order lock released for art_id: ${meta.art_id}, buyer_id: ${meta.buyer_id}`
        );
      } catch (error) {
        createErrorRollbarReport(
          "Stripe Checkout Session webhook processing - Failed to release order lock",
          error as any,
          500
        );
        console.error("Failed to release order lock:", error);
      }
    }

    return NextResponse.json({ status: 200 });
  }

  // Return success for unhandled event types
  console.log(`Unhandled event type: ${event.type}`);
  return NextResponse.json({ status: 200 });
});
