import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import {
  CreateOrderModelTypes,
  InvoiceTypes,
  MetaSchema,
  NotificationPayload,
  PaymentStatusTypes,
} from "@omenai/shared-types";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { retry } from "../../util";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { createWorkflow } from "@omenai/upstash-config";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";

/* ----------------------------- Route ----------------------------------- */

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    const { payment_intent_id, checkout_session_id } = await request.json();

    const { paymentIntent, meta } = await resolvePaymentIntent({
      payment_intent_id,
      checkout_session_id,
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment failed",
        },
        { status: 200 },
      );
    }

    // 🔐 Safely parse metadata (Stripe metadata is string-only)

    await verifyStripeTransaction(paymentIntent, meta);

    return NextResponse.json(
      {
        message: "Successfully verified purchase transaction",
        paymentIntent,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "transactions: verify Stripe transaction",
      error,
      errorResponse.status,
    );

    return NextResponse.json(
      {
        success: false,
        message: errorResponse.message || "Payment verification failed",
      },
      { status: errorResponse.status || 500 },
    );
  }
});

/* ----------------------- Core Verification Logic ------------------------ */

async function verifyStripeTransaction(
  paymentIntent: any,
  meta: MetaSchema & { commission: string },
) {
  const date = toUTCDate(new Date());
  const order = (await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  }).lean()) as CreateOrderModelTypes | null;

  if (!order) return NextResponse.json({ status: 400 });

  if (order.payment_information?.status === "completed") {
    return NextResponse.json({ status: 200 });
  }
  const [existingTransaction, existingPaymentLedger] = await Promise.all([
    PurchaseTransactions.exists({
      trans_reference: paymentIntent.id,
      order_id: order.order_id,
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
      { $set: { verifiedAt: toUTCDate(new Date()) } },
    );
    return;
  }

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

  const amount = paymentIntent.amount_received ?? paymentIntent.amount ?? 0;

  const paymentLedgerData = {
    provider: "stripe",
    provider_tx_id: String(paymentIntent.id),
    status: "successful",
    payment_date: date,
    order_id: order.order_id,
    payload: { meta, provider: "stripe", paymentObj },
    amount: Math.round(amount / 100),
    currency: paymentIntent.currency.toUpperCase(),
    payment_fulfillment: {
      transaction_created: "failed",
      sale_record_created: "failed",
      artwork_marked_sold: "failed",
      mass_orders_updated: "failed",
    },
  };

  let updateResult;
  try {
    updateResult = await PaymentLedger.updateOne(
      { provider: "stripe", provider_tx_id: paymentIntent.id },
      { $setOnInsert: paymentLedgerData },
      { upsert: true },
    );
  } catch (e) {
    console.error("Payment Ledger write failed", e);
    return NextResponse.json({ status: 500 });
  }

  if (updateResult.upsertedCount === 0) {
    return NextResponse.json({ status: 200 });
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
    throw new ServerError("Order update failed");
  }

  await runPurchasePostWorkflows(paymentObj, order, meta);

  try {
    await releaseOrderLock(meta.art_id, meta.buyer_id);
  } catch (error) {
    rollbarServerInstance.error({
      context: "Stripe checkout processing - release lock error",
      error,
    });
  }
}

/* ----------------------- Helpers --------------------------------------- */

async function resolvePaymentIntent({
  payment_intent_id,
  checkout_session_id,
}: {
  payment_intent_id?: string;
  checkout_session_id?: string;
}) {
  if (payment_intent_id) {
    const paymentIntent =
      await stripe.paymentIntents.retrieve(payment_intent_id);

    return { paymentIntent, meta: paymentIntent.metadata };
  }

  if (checkout_session_id) {
    const session =
      await stripe.checkout.sessions.retrieve(checkout_session_id);

    if (!session.payment_intent) {
      throw new ServerError("Checkout session has no payment intent");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent,
    );
    return {
      paymentIntent,
      meta: session.metadata,
    };
  }

  throw new ServerError("No Stripe identifier provided");
}

/* ----------------------- Post-payment workflows ------------------------ */

async function runPurchasePostWorkflows(
  paymentIntent: {
    amount: number;
    amount_received: number;
    id: string;
    currency: string;
  },
  order: CreateOrderModelTypes,
  meta: MetaSchema & { commission: string },
) {
  const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
  const price = formatPrice(
    (paymentIntent.amount_received ?? paymentIntent.amount) / 100,
    currency,
  );

  const buyerAddress = order.shipping_details.addresses.destination;
  const buyerName = order.buyer_details.name;
  const buyerEmail = order.buyer_details.email;
  const buyerId = order.buyer_details.id;
  const { tax_fees, unit_price, shipping_cost } = meta;

  const invoice: Omit<
    InvoiceTypes,
    "storage" | "document_created" | "receipt_sent"
  > = {
    invoiceNumber: `OMENAI-INV-${order.order_id}`,
    recipient: {
      address: buyerAddress,
      name: buyerName,
      email: buyerEmail,
      userId: buyerId,
    },
    orderId: order.order_id,
    currency: paymentIntent.currency.toUpperCase(),
    lineItems: [
      {
        description: order.artwork_data.title,
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
      total: (paymentIntent.amount_received ?? paymentIntent.amount) / 100,
      discount: 0,
    },
    paidAt: toUTCDate(new Date()),
  };

  const [buyerPush, sellerPush] = await Promise.all([
    DeviceManagement.findOne(
      { auth_id: order.buyer_details.id },
      "device_push_token",
    ),
    DeviceManagement.findOne(
      { auth_id: order.seller_details.id },
      "device_push_token",
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
        `notif_buyer_${order.order_id}_workflow`,
        JSON.stringify(payload),
      ),
    );
  }

  if (sellerPush?.device_push_token) {
    const payload: NotificationPayload = {
      to: sellerPush.device_push_token,
      title: "Payment received",
      body: `A payment of ${formatPrice(
        order.artwork_data.pricing.usd_price,
        "USD",
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
        `notif_seller_${order.order_id}_workflow`,
        JSON.stringify(payload),
      ),
    );
  }

  await Promise.all([
    createWorkflow(
      "/api/workflows/shipment/create_shipment",
      `create_shipment_${order.order_id}`,
      JSON.stringify({ order_id: order.order_id }),
    ),
    createWorkflow(
      "/api/workflows/emails/sendPaymentSuccessMail",
      `send_payment_success_mail_${order.order_id}_workflow`,
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
        seller_entity: "gallery",
      }),
    ),
    createWorkflow(
      "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
      `stripe_payment_workflow_${paymentIntent.id}_workflow`,
      JSON.stringify({
        provider: "stripe",
        meta: { ...meta, order_id: order.order_id },
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
