import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";

import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import {
  CreateOrderModelTypes,
  MetaSchema,
  NotificationPayload,
  PaymentStatusTypes,
  SubscriptionTransactionModelSchemaTypes,
} from "@omenai/shared-types";

import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";

import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";

import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { sendPaymentPendingMail } from "@omenai/shared-emails/src/models/payment/sendPaymentPendingMail";

import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
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
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { redis } from "@omenai/upstash-config";
import { NextResponse } from "next/server";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { retry } from "../../resource-global";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

/* -------------------------------------------------------------------------- */
/*                               ROUTE ENTRY                                  */
/* -------------------------------------------------------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
): Promise<Response> {
  try {
    const payload = await verifyStripeWebhook(request);

    if (payload.meta.type === "purchase") {
      return handlePurchaseEvent(payload);
    }

    if (payload.meta.type === "subscription") {
      return handleSubscriptionEvent(payload);
    }

    return NextResponse.json(
      { error: "Unknown transaction type" },
      { status: 400 }
    );
  } catch (error) {
    createErrorRollbarReport(
      "Stripe PaymentIntent webhook processing - fatal error",
      error as any,
      500
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

/* -------------------------------------------------------------------------- */
/*                           STRIPE VERIFICATION                               */
/* -------------------------------------------------------------------------- */

async function verifyStripeWebhook(request: Request) {
  const secretHash = process.env.STRIPE_PAYMENT_INTENT_WEBHOOK_SECRET;
  if (!secretHash) {
    throw new Error("Webhook secret missing");
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Missing Stripe signature");
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, secretHash);

  const supportedTypes = [
    "payment_intent.processing",
    "payment_intent.payment_failed",
    "payment_intent.succeeded",
  ];

  console.log(event.type);
  if (!supportedTypes.includes(event.type)) {
    throw new Error("Unsupported event type");
  }

  const paymentIntent = event.data.object;
  if (!paymentIntent?.id) {
    throw new Error("Missing payment intent ID");
  }

  const pi = await stripe.paymentIntents.retrieve(paymentIntent.id, {
    expand: ["payment_method", "charges.data.balance_transaction"],
  });

  if (!pi.metadata?.type) {
    throw new Error("Missing metadata type");
  }

  await connectMongoDB();

  return { event, pi, meta: pi.metadata };
}

/* -------------------------------------------------------------------------- */
/*                          PURCHASE EVENT ROUTER                              */
/* -------------------------------------------------------------------------- */

async function handlePurchaseEvent({ event, pi, meta }: any) {
  if (event.type === "payment_intent.processing") {
    return handlePurchaseProcessing(meta);
  }

  if (event.type === "payment_intent.payment_failed") {
    return handlePurchaseFailed(meta);
  }

  if (event.type === "payment_intent.succeeded") {
    return handlePurchaseSucceeded(pi, meta);
  }

  return NextResponse.json({ status: 400 });
}

/* -------------------------------------------------------------------------- */
/*                          PURCHASE PROCESSING                                */
/* -------------------------------------------------------------------------- */

async function handlePurchaseProcessing(meta: any) {
  const order = await findPurchaseOrder(meta);
  if (!order) return NextResponse.json({ status: 400 });

  await sendPaymentPendingMail({
    email: meta.buyer_email,
    name: order.buyer_details.name,
    artwork: order.artwork_data.title,
  });

  return NextResponse.json({ status: 200 });
}

async function handlePurchaseFailed(meta: any) {
  const order = await findPurchaseOrder(meta);
  if (!order) return NextResponse.json({ status: 404 });

  await sendPaymentFailedMail({
    email: meta.buyer_email,
    name: order.buyer_details.name,
    artwork: order.artwork_data.title,
  });

  return NextResponse.json({ status: 200 });
}

async function handlePurchaseSucceeded(paymentIntent: any, meta: any) {
  const date = toUTCDate(new Date());

  const { isProcessed } = await purchaseIdempotencyCheck(
    paymentIntent.id,
    "successful"
  );

  if (isProcessed) {
    return NextResponse.json({ status: 200 });
  }

  const order = await findPurchaseOrder(meta);
  if (!order) return NextResponse.json({ status: 400 });

  const paymentLedgerData = {
    provider: "stripe",
    provider_tx_id: String(paymentIntent.id),
    status: String(
      paymentIntent.status === "complete" ? "successful" : "failed"
    ),
    payment_date: toUTCDate(new Date()),
    order_id: order.order_id,
    payload: { meta },
    amount: Math.round(Number(paymentIntent.amount_total / 100)),
    currency: String("USD"),
    payment_fulfillment: {},
  };

  try {
    await retry(
      () =>
        PaymentLedger.updateOne(
          {
            provider: "stripe",
            provider_tx_id: paymentIntent.id,
          },
          {
            $setOnInsert: paymentLedgerData,
          },
          { upsert: true }
        ),
      3,
      150
    );
  } catch (error) {
    rollbarServerInstance.error({
      context: "Stripe Webhook",
      formatted_date: getFormattedDateTime(),
      message: "Payment ledger creation failed after retries",
      error,
      payment_reference: paymentLedgerData?.provider_tx_id,
    });

    return NextResponse.json(
      {
        message:
          "Payment ledger creation unsuccessful. Please refresh your page and try again or contact support.",
      },
      { status: 400 }
    );
  }

  const payment_information: PaymentStatusTypes = {
    status: "completed",
    transaction_value: paymentIntent.amount_total / 100,
    transaction_date: date,
    transaction_reference: paymentIntent.id,
  };

  const updateOrder = await CreateOrder.updateOne(
    { order_id: order.order_id },
    { $set: { payment_information, hold_status: null } }
  );

  if (updateOrder.modifiedCount === 0) {
    rollbarServerInstance.error({
      context: "Stripe Webhook",
      formatted_date: getFormattedDateTime(),
      message: "Order update failed",
    });
    return NextResponse.json(
      { message: "Order update unsuccessful" },
      { status: 400 }
    );
  }

  return processPurchaseTransaction(paymentIntent, meta, order);
}

/* -------------------------------------------------------------------------- */
/*                         PURCHASE TRANSACTION                                */
/* -------------------------------------------------------------------------- */

async function processPurchaseTransaction(
  paymentIntent: any,
  meta: MetaSchema & { commission: string },
  order: any
) {
  try {
    await runPurchasePostWorkflows(paymentIntent, order, meta);

    try {
      await releaseOrderLock(meta.art_id, meta.buyer_id);
    } catch (error) {
      rollbarServerInstance.error({
        context: "Stripe checkout processing - release lock error",
        error,
      });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    createErrorRollbarReport(
      "Stripe PaymentIntent purchase transaction error",
      error,
      500
    );
    return NextResponse.json({ status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                         PURCHASE POST-WORK                                  */
/* -------------------------------------------------------------------------- */

export async function runPurchasePostWorkflows(
  paymentIntent: any,
  order: any,
  meta: MetaSchema & { commission: string }
) {
  const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
  const price = formatPrice(paymentIntent.amount_received / 100, currency);

  const [buyerPush, sellerPush] = await Promise.all([
    DeviceManagement.findOne(
      { auth_id: order.buyer_details.id },
      "device_push_token"
    ),
    DeviceManagement.findOne(
      { auth_id: order.seller_details.id },
      "device_push_token"
    ),
  ]);

  const jobs: Promise<unknown>[] = [];

  if (buyerPush?.device_push_token) {
    const payload: NotificationPayload = {
      to: buyerPush.device_push_token,
      title: "Payment successful",
      body: `Your payment for ${order.artwork_data.title} has been confirmed`,
      data: {
        type: "orders",
        access_type: "collector",
        metadata: {
          orderId: order.order_id,
          date: toUTCDate(new Date()),
        },
        userId: order.buyer_details.id,
      },
    };

    jobs.push(
      createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notif_buyer_${order.order_id}_${generateDigit(2)}`,
        JSON.stringify(payload)
      )
    );
  }

  if (sellerPush?.device_push_token) {
    const payload: NotificationPayload = {
      to: sellerPush.device_push_token,
      title: "Payment received",
      body: `A payment of ${formatPrice(
        order.artwork_data.pricing.usd_price,
        "USD"
      )} has been made for your artpiece`,
      data: {
        type: "orders",
        access_type: order.seller_designation as "artist",
        metadata: {
          orderId: order.order_id,
          date: toUTCDate(new Date()),
        },
        userId: order.seller_details.id,
      },
    };

    jobs.push(
      createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notif_seller_${order.order_id}_${generateDigit(2)}`,
        JSON.stringify(payload)
      )
    );
  }

  await Promise.all([
    createWorkflow(
      "/api/workflows/shipment/create_shipment",
      `create_shipment_${generateDigit(6)}`,
      JSON.stringify({ order_id: order.order_id })
    ),
    createWorkflow(
      "/api/workflows/emails/sendPaymentSuccessMail",
      `send_payment_success_mail_${generateDigit(6)}`,
      JSON.stringify({
        buyer_email: order.buyer_details.email,
        buyer_name: order.buyer_details.name,
        artwork_title: order.artwork_data.title,
        order_id: order.order_id,
        order_date: order.createdAt,
        transaction_id: paymentIntent.id,
        price,
        seller_email: order.seller_details.email,
        seller_name: order.seller_details.name,
      })
    ),

    createWorkflow(
      "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
      `stripe_payment_workflow_${paymentIntent.id}`,
      JSON.stringify({
        provider: "stripe",
        meta,
        paymentIntent,
      })
    ),
    ...jobs,
  ]);
}

/* -------------------------------------------------------------------------- */
/*                       SUBSCRIPTION EVENT ROUTER                             */
/* -------------------------------------------------------------------------- */

async function handleSubscriptionEvent({ event, pi, meta }: any) {
  if (event.type === "payment_intent.processing") {
    return handleSubscriptionProcessing(pi, meta);
  }

  if (event.type === "payment_intent.payment_failed") {
    return handleSubscriptionFailed(pi, meta);
  }

  if (event.type === "payment_intent.succeeded") {
    return handleSubscriptionSucceeded(pi, meta);
  }

  return NextResponse.json({ status: 400 });
}

/* -------------------------------------------------------------------------- */
/*                       SUBSCRIPTION HANDLERS                                 */
/* -------------------------------------------------------------------------- */

async function handleSubscriptionProcessing(paymentIntent: any, meta: any) {
  return updateSubscriptionStatus(
    paymentIntent,
    meta,
    "processing",
    sendSubscriptionPaymentPendingMail
  );
}

async function handleSubscriptionFailed(paymentIntent: any, meta: any) {
  return updateSubscriptionStatus(
    paymentIntent,
    meta,
    "failed",
    sendSubscriptionPaymentFailedMail
  );
}

async function handleSubscriptionSucceeded(paymentIntent: any, meta: any) {
  const { isProcessed } = await subscriptionIdempotencyCheck(
    paymentIntent.id,
    String(paymentIntent.customer ?? meta.customer ?? ""),
    "successful"
  );

  if (isProcessed) {
    return NextResponse.json({ status: 200 });
  }

  return processSubscriptionSuccess(paymentIntent, meta);
}

/* -------------------------------------------------------------------------- */
/*                       SUBSCRIPTION CORE LOGIC                               */
/* -------------------------------------------------------------------------- */

async function processSubscriptionSuccess(paymentIntent: any, meta: any) {
  const client = await connectMongoDB();
  const session = await client.startSession();

  const nowUTC = toUTCDate(new Date());
  const customer = String(paymentIntent.customer ?? meta.customer ?? "");

  try {
    session.startTransaction();

    const planId = meta.plan_id ?? meta.planId;
    const planInterval = meta.plan_interval ?? meta.planInterval;

    if (!planId || !planInterval) {
      return NextResponse.json({ status: 400 });
    }

    const [plan, existingSubscription] = await Promise.all([
      SubscriptionPlan.findOne({ plan_id: planId }).session(session),
      Subscriptions.findOne({ stripe_customer_id: customer }).session(session),
    ]);

    if (!plan) {
      return NextResponse.json({ status: 400 });
    }

    const expiryDate = getSubscriptionExpiryDate(planInterval);

    const txnData: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> = {
      amount: Number(paymentIntent.amount) / 100,
      payment_ref: paymentIntent.id,
      date: nowUTC,
      gallery_id: meta.gallery_id,
      status: "successful",
      stripe_customer_id: customer,
    };

    await SubscriptionTransactions.findOneAndUpdate(
      { payment_ref: paymentIntent.id },
      { $set: txnData },
      { upsert: true, new: true, session }
    );

    const subPayload = {
      start_date: nowUTC,
      expiry_date: expiryDate,
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
        interval: planInterval,
      },
      upload_tracker: {
        limit: getUploadLimitLookup(plan.name, planInterval),
        next_reset_date: expiryDate.toISOString(),
        upload_count: existingSubscription?.upload_tracker?.upload_count ?? 0,
      },
    };

    if (existingSubscription) {
      await Subscriptions.updateOne(
        { stripe_customer_id: customer },
        { $set: subPayload },
        { session }
      );
    } else {
      await Subscriptions.create([subPayload], { session });
    }

    await AccountGallery.updateOne(
      { gallery_id: meta.gallery_id },
      { $set: { subscription_status: { type: plan.name, active: true } } },
      { session }
    );

    await session.commitTransaction();

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
      "Stripe subscription success processing error",
      error,
      500
    );
    return NextResponse.json({ status: 500 });
  } finally {
    await session.endSession();
  }
}

/* -------------------------------------------------------------------------- */
/*                             HELPERS                                        */
/* -------------------------------------------------------------------------- */

async function updateSubscriptionStatus(
  paymentIntent: any,
  meta: any,
  status: string,
  mailer: Function
) {
  const { isProcessed } = await subscriptionIdempotencyCheck(
    paymentIntent.id,
    String(paymentIntent.customer ?? meta.customer ?? ""),
    status
  );

  if (isProcessed) {
    return NextResponse.json({ status: 400 });
  }

  const client = await connectMongoDB();
  const session = await client.startSession();

  try {
    session.startTransaction();

    await SubscriptionTransactions.updateOne(
      { payment_ref: paymentIntent.id },
      { $set: { status } },
      { session }
    );

    await session.commitTransaction();
    await mailer({ name: meta.name, email: meta.email });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

async function findPurchaseOrder(meta: MetaSchema & { commission: string }) {
  const order = (await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  }).lean()) as unknown as CreateOrderModelTypes | null;

  return order;
}

async function subscriptionIdempotencyCheck(
  paymentId: string,
  customerId: string,
  status: string
) {
  const existingPayment = await SubscriptionTransactions.findOne({
    payment_ref: paymentId,
    stripe_customer_id: customerId,
  });

  if (existingPayment?.status === status) {
    return { isProcessed: true, existingPayment };
  }

  return { isProcessed: false, existingPayment: null };
}

async function purchaseIdempotencyCheck(paymentId: string, status: string) {
  // Check idempotency: has this transaction been processed successfully before?
  const [existingTransaction, existingPaymentLedger] = await Promise.all([
    PurchaseTransactions.exists({
      trans_reference: paymentId,
    }),
    PaymentLedger.exists({
      provider: "stripe",
      provider_tx_id: paymentId,
      payment_fulfillment_checks_done: true,
    }),
  ]);

  if (existingTransaction || existingPaymentLedger) {
    await PurchaseTransactions.updateOne(
      { trans_reference: paymentId },
      {
        $set: {
          webhookReceivedAt: toUTCDate(new Date()),
          webhookConfirmed: true,
        },
      }
    );
    return { isProcessed: true };
  }

  return { isProcessed: false, existingPayment: null };
}
