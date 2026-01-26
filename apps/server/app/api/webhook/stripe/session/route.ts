import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import {
  CreateOrderModelTypes,
  InvoiceTypes,
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
import { retry } from "../../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

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

  const paymentIntentId =
    typeof sessionObj.payment_intent === "string"
      ? sessionObj.payment_intent
      : sessionObj.payment_intent?.id;

  if (!paymentIntentId) {
    rollbarServerInstance.error({
      context: "Stripe webhook: missing payment_intent on session",
      session_id: sessionObj.id,
    });

    return NextResponse.json({ status: 400 });
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    rollbarServerInstance.error({
      context: "Stripe webhook: failed to retrieve payment intent",
      payment_intent_id: paymentIntentId,
      error,
    });

    return NextResponse.json({ status: 400 });
  }

  const amount = paymentIntent.amount_received ?? paymentIntent.amount;

  const date = toUTCDate(new Date());

  if (paymentIntent.status !== "succeeded") {
    // Send failed mail
    return NextResponse.json({ status: 400 });
  }

  const meta: MetaSchema = paymentIntent.metadata;
  if (!meta?.buyer_email || !meta?.art_id) {
    return NextResponse.json({ status: 400 });
  }

  // Check idempotency: has this transaction been processed successfully before?
  const [existingTransaction, existingPaymentLedger] = await Promise.all([
    PurchaseTransactions.exists({
      trans_reference: paymentIntent.id,
    }),
    PaymentLedger.exists({
      provider: "stripe",
      provider_tx_id: paymentIntent.id,
      payment_fulfillment_checks_done: true,
    }),
  ]);

  if (existingTransaction || existingPaymentLedger) {
    await PurchaseTransactions.updateOne(
      { trans_reference: paymentIntent.id },
      {
        $set: {
          webhookReceivedAt: toUTCDate(new Date()),
          webhookConfirmed: true,
        },
      },
    );
    return NextResponse.json({ status: 200 });
  }

  const order = (await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  }).lean()) as unknown as CreateOrderModelTypes | null;

  if (!order) return NextResponse.json({ status: 400 });

  const paymentObj: {
    amount: number;
    amount_received: number;
    id: string;
    currency: string;
  } = {
    amount: paymentIntent.amount,
    amount_received: paymentIntent.amount_received,
    id: paymentIntent.id,
    currency: paymentIntent.currency,
  };

  const paymentLedgerData = {
    provider: "stripe",
    provider_tx_id: String(paymentIntent.id),
    status: String(
      paymentIntent.status === "succeeded" ? "successful" : "failed",
    ),
    payment_date: toUTCDate(new Date()),
    order_id: order.order_id,
    payload: { meta, provider: "stripe", paymentObj },
    amount: Math.round(Number(amount / 100)),
    currency: String(paymentIntent.currency.toUpperCase()),
    payment_fulfillment: {
      transaction_created: "failed",
      sale_record_created: "failed",
      artwork_marked_sold: "failed",
      mass_orders_updated: "failed",
    },
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
          { upsert: true },
        ),
      3,
      150,
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
      { status: 400 },
    );
  }

  const payment_information: PaymentStatusTypes = {
    status: "completed",
    transaction_value: amount / 100,
    transaction_date: date,
    transaction_reference: paymentIntent.id,
  };

  const updateOrder = await CreateOrder.updateOne(
    { order_id: order.order_id },
    { $set: { payment_information, hold_status: null } },
  );

  if (updateOrder.modifiedCount === 0) {
    rollbarServerInstance.error({
      context: "Stripe Webhook",
      formatted_date: getFormattedDateTime(),
      message: "Order update failed",
    });
    return NextResponse.json(
      { message: "Order update unsuccessful" },
      { status: 400 },
    );
  }
  return processStripePayment(paymentObj, meta, order);
}

/* -------------------------------------------------------------------------- */
/*                         STRIPE PAYMENT PROCESSOR                            */
/* -------------------------------------------------------------------------- */

async function processStripePayment(
  paymentIntent: {
    amount: number;
    amount_received: number;
    id: string;
    currency: string;
  },
  meta: any,
  order_info: any,
) {
  try {
    await runPostPaymentWorkflows(paymentIntent, order_info, meta);

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
  paymentIntent: {
    amount: number;
    amount_received: number;
    id: string;
    currency: string;
  },
  order_info: CreateOrderModelTypes,
  meta: MetaSchema & { commission: number },
) {
  const amount = paymentIntent.amount_received ?? paymentIntent.amount;
  const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
  const price = formatPrice(Math.round(Number(meta.unit_price)), currency);
  const buyerAddress = order_info.shipping_details.addresses.destination;
  const buyerName = order_info.buyer_details.name;
  const buyerEmail = order_info.buyer_details.email;
  const buyerId = order_info.buyer_details.id;
  const { tax_fees, unit_price, shipping_cost } = meta;

  const invoice: Omit<
    InvoiceTypes,
    "storage" | "document_created" | "receipt_sent"
  > = {
    invoiceNumber: `OMENAI-INV-${order_info.order_id}`,
    recipient: {
      address: buyerAddress,
      name: buyerName,
      email: buyerEmail,
      userId: buyerId,
    },
    orderId: order_info.order_id,
    currency: paymentIntent.currency.toUpperCase(),
    lineItems: [
      {
        description: order_info.artwork_data.title,
        quantity: 1,
        unitPrice: Math.round(Number(unit_price)),
      },
      {
        description: "Certificate of Authenticity",
        quantity: 1,
        unitPrice: 0,
      },
    ],
    pricing: {
      taxes: Math.round(Number(tax_fees)),
      shipping: Math.round(Number(shipping_cost)),
      unitPrice: Math.round(Number(unit_price)),
      total: amount / 100,
      discount: 0,
    },
    paidAt: toUTCDate(new Date()),
  };

  const [buyer_push, seller_push] = await Promise.all([
    DeviceManagement.findOne(
      { auth_id: order_info.buyer_details.id },
      "device_push_token",
    ),
    DeviceManagement.findOne(
      { auth_id: order_info.seller_details.id },
      "device_push_token",
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
        `notif_buyer_${order_info.order_id}_workflow`,
        JSON.stringify(payload),
      ),
    );
  }

  if (seller_push?.device_push_token) {
    const payload: NotificationPayload = {
      to: seller_push.device_push_token,
      title: "Payment received",
      body: `A payment of ${formatPrice(
        order_info.artwork_data.pricing.usd_price,
        "USD",
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
        `notif_seller_${order_info.order_id}_workflow`,
        JSON.stringify(payload),
      ),
    );
  }

  await Promise.all([
    createWorkflow(
      "/api/workflows/shipment/create_shipment",
      `create_shipment_${order_info.order_id}_workflow`,
      JSON.stringify({ order_id: order_info.order_id }),
    ),
    createWorkflow(
      "/api/workflows/emails/sendPaymentSuccessMail",
      `send_payment_success_mail_${order_info.order_id}_workflow`,
      JSON.stringify({
        buyer_email: order_info.buyer_details.email,
        buyer_name: order_info.buyer_details.name,
        artwork_title: order_info.artwork_data.title,
        order_id: order_info.order_id,
        order_date: order_info.createdAt,
        transaction_id: paymentIntent.id,
        price,
        seller_email: order_info.seller_details.email,
        seller_name: order_info.seller_details.name,
        seller_entity: "gallery",
      }),
    ),
    createWorkflow(
      "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
      `stripe_payment_workflow_${paymentIntent.id}_workflow`,
      JSON.stringify({
        provider: "stripe",
        meta,
        paymentIntent,
      }),
    ),
    createWorkflow(
      "/api/workflows/emails/sendPaymentInvoice",
      `send_payment_invoice${invoice.invoiceNumber}_workflow`,
      JSON.stringify({
        invoice,
      }),
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
        500,
      );
    }
  }

  return NextResponse.json({ status: 200 });
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTE                                    */
/* -------------------------------------------------------------------------- */

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
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
