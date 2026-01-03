import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import {
  CreateOrderModelTypes,
  MetaSchema,
  NotificationPayload,
  PaymentStatusTypes,
} from "@omenai/shared-types";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NextResponse } from "next/server";
import { createErrorRollbarReport } from "../../../util";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { retry } from "../../resource-global";

/* -------------------------------------------------------------------------- */
/*                            STRIPE VERIFICATION                              */
/* -------------------------------------------------------------------------- */

async function verifyStripeWebhook(request: Request) {
  const secret = process.env.STRIPE_CHECKOUT_SESSION_WEBHOOK_SECRET;
  if (!secret)
    throw new Error("Missing STRIPE_CHECKOUT_SESSION_WEBHOOK_SECRET");

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) throw new Error("Missing Stripe signature");

  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/* -------------------------------------------------------------------------- */
/*                         CHECKOUT COMPLETED FLOW                             */
/* -------------------------------------------------------------------------- */

async function handleCheckoutCompleted(event: any) {
  const sessionObj = event.data.object;

  const date = toUTCDate(new Date());

  if (
    sessionObj.status !== "complete" ||
    sessionObj.payment_status !== "paid"
  ) {
    return NextResponse.json({ status: 400 });
  }

  const meta: MetaSchema = sessionObj.metadata;
  if (!meta?.buyer_email || !meta?.art_id) {
    return NextResponse.json({ status: 400 });
  }

  // Check idempotency: has this transaction been processed successfully before?
  const [existingTransaction, existingPaymentLedger] = await Promise.all([
    PurchaseTransactions.exists({
      trans_reference: sessionObj.id,
    }),
    PaymentLedger.exists({
      provider: "stripe",
      provider_tx_id: sessionObj.id,
      payment_fulfillment_checks_done: true,
    }),
  ]);

  if (existingTransaction || existingPaymentLedger) {
    await PurchaseTransactions.updateOne(
      { trans_reference: sessionObj.id },
      {
        $set: {
          webhookReceivedAt: toUTCDate(new Date()),
          webhookConfirmed: true,
        },
      }
    );
    return NextResponse.json({ status: 200 });
  }

  const order = (await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  }).lean()) as unknown as CreateOrderModelTypes | null;

  if (!order) return NextResponse.json({ status: 400 });

  const paymentLedgerData = {
    provider: "stripe",
    provider_tx_id: String(sessionObj.id),
    status: String(sessionObj.status === "complete" ? "successful" : "failed"),
    payment_date: toUTCDate(new Date()),
    order_id: order.order_id,
    payload: { meta },
    amount: Math.round(Number(sessionObj.amount_total / 100)),
    currency: String("USD"),
    payment_fulfillment: {},
  };

  try {
    await retry(
      () =>
        PaymentLedger.updateOne(
          {
            provider: "stripe",
            provider_tx_id: sessionObj.id,
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
    transaction_value: sessionObj.amount_total / 100,
    transaction_date: date,
    transaction_reference: sessionObj.id,
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
  return processStripePayment(sessionObj, meta, order);
}

/* -------------------------------------------------------------------------- */
/*                         STRIPE PAYMENT PROCESSOR                            */
/* -------------------------------------------------------------------------- */

async function processStripePayment(
  checkoutSession: any,
  meta: any,
  order_info: any
) {
  try {
    await runPostPaymentWorkflows(checkoutSession, order_info, meta);

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
    createErrorRollbarReport("Stripe checkout processing error", error, 500);

    return NextResponse.json({ status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                        POST-PAYMENT WORKFLOWS                               */
/* -------------------------------------------------------------------------- */

export async function runPostPaymentWorkflows(
  checkoutSession: any,
  order_info: any,
  meta: any
) {
  const currency = getCurrencySymbol(checkoutSession.currency.toUpperCase());
  const price = formatPrice(checkoutSession.amount_total / 100, currency);

  const [buyer_push, seller_push] = await Promise.all([
    DeviceManagement.findOne(
      { auth_id: order_info.buyer_details.id },
      "device_push_token"
    ),
    DeviceManagement.findOne(
      { auth_id: order_info.seller_details.id },
      "device_push_token"
    ),
  ]);

  const jobs: Promise<unknown>[] = [];

  if (buyer_push?.device_push_token) {
    const payload: NotificationPayload = {
      to: buyer_push.device_push_token,
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

    jobs.push(
      createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notif_buyer_${order_info.order_id}_${generateDigit(2)}`,
        JSON.stringify(payload)
      )
    );
  }

  if (seller_push?.device_push_token) {
    const payload: NotificationPayload = {
      to: seller_push.device_push_token,
      title: "Payment received",
      body: `A payment of ${formatPrice(
        order_info.artwork_data.pricing.usd_price,
        "USD"
      )} has been made for your artpiece`,
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

    jobs.push(
      createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notif_seller_${order_info.order_id}_${generateDigit(6)}`,
        JSON.stringify(payload)
      )
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
      `send_payment_success_mail_${generateDigit(6)}`,
      JSON.stringify({
        buyer_email: order_info.buyer_details.email,
        buyer_name: order_info.buyer_details.name,
        artwork_title: order_info.artwork_data.title,
        order_id: order_info.order_id,
        order_date: order_info.createdAt,
        transaction_id: checkoutSession.id,
        price,
        seller_email: order_info.seller_details.email,
        seller_name: order_info.seller_details.name,
      })
    ),
    createWorkflow(
      "/api/workflows/payment/handleArtworkPaymentUpdatesByStripe",
      `stripe_payment_workflow_${checkoutSession.id}`,
      JSON.stringify({
        provider: "stripe",
        meta,
        checkoutSession,
      })
    ),
    ...jobs,
  ]);
}

/* -------------------------------------------------------------------------- */
/*                         CHECKOUT SESSION EXPIRED                            */
/* -------------------------------------------------------------------------- */

async function handleCheckoutExpired(event: any) {
  const meta = event.data.object.metadata;

  if (meta?.art_id && meta?.buyer_id) {
    try {
      await releaseOrderLock(meta.art_id, meta.buyer_id);
    } catch (error) {
      createErrorRollbarReport(
        "Stripe checkout expired - release lock error",
        error,
        500
      );
    }
  }

  return NextResponse.json({ status: 200 });
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTE                                    */
/* -------------------------------------------------------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const event = await verifyStripeWebhook(request);

    if (event.type === "checkout.session.completed") {
      return handleCheckoutCompleted(event);
    }

    if (event.type === "checkout.session.expired") {
      return handleCheckoutExpired(event);
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    createErrorRollbarReport("Stripe Checkout webhook processing", error, 500);
    return NextResponse.json({ status: 400 });
  }
});
