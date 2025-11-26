import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import type Stripe from "stripe";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
  SubscriptionTransactionModelSchemaTypes,
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
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import {
  SubscriptionPlan,
  Subscriptions,
} from "@omenai/shared-models/models/subscriptions";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";

import { getUploadLimitLookup } from "@omenai/shared-utils/src/uploadLimitUtility";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { sendSubscriptionPaymentPendingMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentPendingMail";
import { createErrorRollbarReport } from "../../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  // Validate environment variable
  const secretHash = process.env.STRIPE_PAYMENT_INTENT_WEBHOOK_SECRET;
  if (!secretHash) {
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  let event;
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
    createErrorRollbarReport(
      "Stripe PaymentIntent webhook processing - Invalid webhook signature",
      err as any,
      500
    );
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Only handle supported event types
  const supportedTypes = [
    "payment_intent.processing",
    "payment_intent.payment_failed",
    "payment_intent.succeeded",
  ];
  if (!supportedTypes.includes(event.type)) {
    return NextResponse.json(
      { error: "Unsupported event type" },
      { status: 400 }
    );
  }

  const paymentIntent = event.data.object;
  if (!paymentIntent?.id) {
    return NextResponse.json(
      { error: "Missing payment intent ID" },
      { status: 400 }
    );
  }

  // Retrieve PI from Stripe
  let pi;
  try {
    pi = await stripe.paymentIntents.retrieve(paymentIntent.id, {
      expand: ["payment_method", "charges.data.balance_transaction"],
    });
  } catch (err) {
    createErrorRollbarReport(
      "Stripe PaymentIntent webhook processing - Payment not found",
      err as any,
      404
    );
    return NextResponse.json(
      { error: "PaymentIntent not found" },
      { status: 404 }
    );
  }

  const meta = pi.metadata;
  if (!meta?.type) {
    return NextResponse.json(
      { error: "Missing metadata type" },
      { status: 400 }
    );
  }

  // Connect to MongoDB but DON'T start a session here
  await connectMongoDB();

  try {
    if (meta.type === "subscription") {
      // Create a new session specifically for subscription handling
      return await handleSubscriptionPayment(pi, meta, event);
    } else if (meta.type === "purchase") {
      // Create a new session specifically for purchase handling
      return await handlePurchaseTransaction(pi, meta, event);
    } else {
      return NextResponse.json(
        { error: "Unknown transaction type" },
        { status: 400 }
      );
    }
  } catch (err) {
    createErrorRollbarReport(
      "Stripe PaymentIntent webhook processing - Internal server error",
      err as any,
      500
    );
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

const handlePurchaseTransaction = async (
  paymentIntent: any,
  meta: any,
  event: any
) => {
  const { isProcessed, existingPayment } = await purchaseIdempotencyCheck(
    paymentIntent.id,
    paymentIntent.status
  );

  if (isProcessed) {
    return NextResponse.json({ status: 200 });
  }

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

  if (event.type === "payment_intent.processing") {
    try {
      await sendPaymentPendingMail({
        email: meta.buyer_email,
        name: order_info.buyer_details.name,
        artwork: order_info.artwork_data.title,
      });
    } catch (error) {
      createErrorRollbarReport(
        "Stripe PaymentIntent webhook processing - Failed to send payment pending email",
        error,
        500
      );
      console.error("Failed to send payment pending email:", error);
    }
    return NextResponse.json({ status: 200 });
  }

  if (event.type === "payment_intent.payment_failed") {
    try {
      await sendPaymentFailedMail({
        email: meta.buyer_email,
        name: order_info.buyer_details.name,
        artwork: order_info.artwork_data.title,
      });
    } catch (error) {
      createErrorRollbarReport(
        "Stripe PaymentIntent webhook processing - Failed to send payment failed email",
        error,
        500
      );
      console.error("Failed to send payment failed email:", error);
    }
    return NextResponse.json({ status: 200 });
  }

  if (event.type === "payment_intent.succeeded") {
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ status: 400 });
    }

    const domainStatus = "successful";
    let transaction_id;

    const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
    const formatted_date = getFormattedDateTime();
    const date = toUTCDate(new Date());

    // Create a fresh session and start transaction
    const client = await connectMongoDB();
    const session = await client.startSession();

    try {
      // Remove hold status before starting transaction (without session)
      await CreateOrder.updateOne(
        { order_id: order_info.order_id },
        { $set: { hold_status: null } }
      );

      // Start the transaction with the session
      await session.startTransaction();

      // Update Order Payment Information
      const payment_information: PaymentStatusTypes = {
        status: "completed",
        transaction_value: paymentIntent.amount_received / 100,
        transaction_date: formatted_date,
        transaction_reference: paymentIntent.id,
      };

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

      // Update transaction collection
      const transaction_pricing: PurchaseTransactionPricing = {
        amount_total: Math.round(paymentIntent.amount_total / 100),
        unit_price: Math.round(+meta.unit_price),
        shipping_cost: Math.round(+meta.shipping_cost),
        commission: Math.round(+meta.commission),
        tax_fees: Math.round(+meta.tax_fees),
        currency: "USD",
      };

      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_pricing: transaction_pricing,
        trans_date: date,
        trans_recipient_id: meta.seller_id,
        trans_initiator_id: meta.buyer_id,
        trans_recipient_role: "gallery",
        trans_reference: paymentIntent.id,
        status: domainStatus,
      };

      const create_transaction = await PurchaseTransactions.create([data], {
        session,
      });
      transaction_id = create_transaction[0].trans_id;

      // Update Artwork Availability
      await Artworkuploads.updateOne(
        { art_id: meta.art_id },
        { $set: { availability: false } },
        { session }
      );

      // Add to sales activity
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
      console.log("Purchase transaction committed successfully.");

      // Handle post-transaction operations (outside of transaction)
      // Clear the order lock
      await releaseOrderLock(meta.art_id, meta.buyer_id);

      const price = formatPrice(paymentIntent.amount_received / 100, currency);

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
              "Stripe PaymentIntent webhook processing - Failed to send buyer notification",
              error,
              500
            );
            console.error("Failed to send buyer notification:", error);
          })
        );
      }

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
              "Stripe PaymentIntent webhook processing - Failed to send seller notification",
              error,
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
            "Stripe PaymentIntent webhook processing - Failed to create shipment workflow",
            error,
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
          console.error("Failed to send payment success mail workflow:", error);
        }),
        ...notificationPromises,
      ]);

      return NextResponse.json({ status: 200 });
    } catch (error) {
      createErrorRollbarReport(
        "Stripe PaymentIntent webhook processing - An error occurred during the purchase transaction",
        error,
        500
      );
      console.error(
        "An error occurred during the purchase transaction:",
        error
      );

      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      return NextResponse.json({ status: 500 });
    } finally {
      // Always end the session
      await session.endSession();
    }
  }

  return NextResponse.json({ status: 400 });
};

const handleSubscriptionPayment = async (
  paymentIntent: any,
  meta: any,
  event: any
) => {
  const domainStatus =
    paymentIntent.status === "succeeded"
      ? "successful"
      : paymentIntent.status === "processing"
        ? "processing"
        : "failed";

  const { isProcessed, existingPayment } = await subscriptionIdempotencyCheck(
    paymentIntent.id,
    String(paymentIntent.customer ?? meta.customer ?? ""),
    domainStatus
  );

  if (event.type === "payment_intent.processing") {
    if (isProcessed) return NextResponse.json({ status: 400 });

    // Create a fresh session for this specific operation
    const client = await connectMongoDB();
    const session = await client.startSession();

    try {
      await session.startTransaction();

      await SubscriptionTransactions.updateOne(
        { payment_ref: paymentIntent.id },
        { $set: { status: domainStatus } },
        { session }
      );

      await session.commitTransaction();

      // Send email notification (outside transaction)
      await sendSubscriptionPaymentPendingMail({
        name: meta.name,
        email: meta.email,
      });

      return NextResponse.json({ status: 200 });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      createErrorRollbarReport(
        "Stripe PaymentIntent webhook processing - An error occurred during the purchase transaction",
        error,
        500
      );
      console.error("Error processing payment_intent.processing:", error);
      return NextResponse.json({ status: 500 });
    } finally {
      await session.endSession();
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    if (isProcessed) return NextResponse.json({ status: 400 });

    // Create a fresh session for this specific operation
    const client = await connectMongoDB();
    const session = await client.startSession();

    try {
      session.startTransaction();

      await SubscriptionTransactions.updateOne(
        { payment_ref: paymentIntent.id },
        { $set: { status: domainStatus } },
        { session }
      );

      await session.commitTransaction();

      // Send email notification (outside transaction)
      await sendSubscriptionPaymentFailedMail({
        name: meta.name,
        email: meta.email,
      });

      return NextResponse.json({ status: 200 });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      createErrorRollbarReport(
        "Stripe PaymentIntent webhook processing - Mongo transaction error",
        error,
        500
      );
      console.error("Error processing payment_intent.payment_failed:", error);
      return NextResponse.json({ status: 500 });
    } finally {
      await session.endSession();
    }
  }

  if (event.type === "payment_intent.succeeded") {
    if (isProcessed) return NextResponse.json({ status: 200 });

    const valueAmountInUnits = Number(paymentIntent.amount) / 100;
    const nowUTC = toUTCDate(new Date());

    const txnData: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> = {
      amount: valueAmountInUnits,
      payment_ref: paymentIntent.id,
      date: nowUTC,
      gallery_id: meta.gallery_id,
      status: domainStatus,
      stripe_customer_id: String(paymentIntent.customer ?? ""),
    };

    const plan_id = meta.plan_id ?? meta.planId;
    const plan_interval = meta.plan_interval ?? meta.planInterval;
    const customer = String(paymentIntent.customer ?? meta.customer ?? "");
    const paymentMethod =
      paymentIntent.payment_method as Stripe.PaymentMethod | null;

    if (!plan_id || !plan_interval) {
      return NextResponse.json({ status: 400 });
    }

    // Create a fresh session for this specific operation
    const client = await connectMongoDB();
    const session = await client.startSession();

    try {
      await session.startTransaction();

      // Fetch plan and existing subscription within transaction
      const [plan, existingSubscription] = await Promise.all([
        SubscriptionPlan.findOne({ plan_id }).session(session),
        Subscriptions.findOne({ stripe_customer_id: customer }).session(
          session
        ),
      ]);

      if (!plan) {
        await session.abortTransaction();
        return NextResponse.json({ status: 400 });
      }

      const expiryDate = getSubscriptionExpiryDate(plan_interval);

      const subPayload = {
        start_date: nowUTC,
        expiry_date: expiryDate,
        paymentMethod: paymentMethod ?? undefined,
        stripe_customer_id: customer,
        customer: {
          name: meta.name,
          email: meta.email,
          gallery_id: meta.gallery_id,
        },
        status: "active",
        plan_details: {
          type: plan.name,
          value: plan.pricing,
          currency: plan.currency,
          interval: plan_interval,
        },
        next_charge_params: {
          value:
            plan_interval === "monthly"
              ? +plan.pricing.monthly_price
              : +plan.pricing.annual_price,
          currency: "USD",
          type: plan.name,
          interval: plan_interval,
          id: plan.plan_id,
        },
        upload_tracker: {
          limit: getUploadLimitLookup(plan.name, plan_interval),
          next_reset_date: expiryDate.toISOString(),
          upload_count: existingSubscription
            ? (existingSubscription.upload_tracker?.upload_count ?? 0)
            : 0,
        },
      };

      // Update/create subscription transaction
      await SubscriptionTransactions.findOneAndUpdate(
        { payment_ref: paymentIntent.id },
        { $set: txnData },
        { upsert: true, new: true, session }
      );

      // Handle subscription creation or update
      if (!existingSubscription) {
        await Subscriptions.create([subPayload], { session });
      } else {
        const isActiveAndNotExpired =
          existingSubscription.status === "active" &&
          new Date(existingSubscription.expiry_date) > nowUTC;

        if (isActiveAndNotExpired) {
          const upload_tracker = {
            limit: getUploadLimitLookup(plan.name, plan_interval),
            next_reset_date: expiryDate.toISOString(),
            upload_count:
              existingSubscription.upload_tracker?.upload_count ?? 0,
          };
          await Subscriptions.updateOne(
            { stripe_customer_id: customer },
            { $set: { ...subPayload, upload_tracker } },
            { session }
          );
        } else {
          await Subscriptions.updateOne(
            { stripe_customer_id: customer },
            { $set: subPayload },
            { session }
          );
        }
      }

      // Update account gallery
      await AccountGallery.updateOne(
        { gallery_id: meta.gallery_id },
        { $set: { subscription_status: { type: plan.name, active: true } } },
        { session }
      );

      await session.commitTransaction();
      console.log("Subscription transaction committed successfully.");

      // Send subscription payment email (outside transaction)
      await sendSubscriptionPaymentSuccessfulMail({
        name: meta.name ?? "",
        email: meta.email ?? "",
      });

      return NextResponse.json({ status: 200 });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      createErrorRollbarReport(
        "Stripe PaymentIntent webhook processing - An error occurred during the purchase transaction",
        error,
        500
      );
      console.error("Error processing payment_intent.succeeded:", error);
      return NextResponse.json({ status: 500 });
    } finally {
      await session.endSession();
    }
  }

  return NextResponse.json({ status: 400 });
};

async function subscriptionIdempotencyCheck(
  paymentId: string,
  customerId: string,
  status: string
) {
  try {
    const existingPayment = await SubscriptionTransactions.findOne({
      payment_ref: paymentId,
      stripe_customer_id: customerId,
    });

    if (existingPayment) {
      if (existingPayment.status === status)
        return { isProcessed: true, existingPayment };
    }

    return { isProcessed: false, existingPayment: null };
  } catch (error) {
    createErrorRollbarReport(
      "Stripe PaymentIntent webhook processing - Subscription idempotency check error",
      error,
      500
    );
    console.error("Error in subscriptionIdempotencyCheck:", error);
    throw error;
  }
}

async function purchaseIdempotencyCheck(paymentId: string, status: string) {
  try {
    const existingPayment = await PurchaseTransactions.findOne({
      trans_reference: paymentId,
    });

    if (existingPayment) {
      if (existingPayment.status === status)
        return { isProcessed: true, existingPayment };
    }

    return { isProcessed: false, existingPayment: null };
  } catch (error) {
    console.error("Error in purchaseIdempotencyCheck:", error);
    throw error;
  }
}
