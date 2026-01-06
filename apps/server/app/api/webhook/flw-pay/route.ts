import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  InvoiceTypes,
  NotificationPayload,
  PaymentStatusTypes,
} from "@omenai/shared-types";
import { z } from "zod";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { createErrorRollbarReport, MetaSchema, retry } from "../../util";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
/* ----------------------------- Schema ------------------------------------- */

/* ----------------------------- Utilities ---------------------------------- */

function verifyWebhookSignature(
  headerHash: string | null | undefined,
  secret: string
): boolean {
  if (!headerHash || !secret) return false;

  try {
    const a = Buffer.from(headerHash, "utf8");
    const b = Buffer.from(secret, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function fireAndForget(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    createErrorRollbarReport(
      "Flutterwave webhook fire-and-forget error",
      err as any,
      500
    );
  }
}

/* ----------------------------- Business helpers --------------------------- */

function shouldExitEarly(flwStatus: string, verified: any, body: any): boolean {
  if (flwStatus === "pending" || flwStatus === "failed") return true;

  const tv = String(verified.data.tx_ref ?? "");
  const req_tx_ref = String(body?.data?.tx_ref ?? "");
  const verifiedAmount = String(verified.data.amount ?? "");
  const reqAmount = String(body?.data?.amount ?? "");
  const verifiedCurrency = String(verified.data.currency ?? "");
  const reqCurrency = String(body?.data?.currency ?? "");

  return !(
    flwStatus === "successful" &&
    tv &&
    tv === req_tx_ref &&
    verifiedAmount === reqAmount &&
    verifiedCurrency === reqCurrency
  );
}

export async function sendPushNotifications(order_info: any) {
  const buyer_push = await DeviceManagement.findOne(
    { auth_id: order_info.buyer_details.id },
    "device_push_token"
  );

  const seller_push = await DeviceManagement.findOne(
    { auth_id: order_info.seller_details.id },
    "device_push_token"
  );

  const jobs: Promise<unknown>[] = [];

  if (buyer_push?.device_push_token) {
    const buyerPayload: NotificationPayload = {
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
        `notification_workflow_buyer_${order_info.order_id}_${toUTCDate(new Date())}`,
        JSON.stringify(buyerPayload)
      ).catch((err) => {
        createErrorRollbarReport(
          "Flutterwave webhook processing - Buyer notification",
          err,
          500
        );
      })
    );
  }

  if (seller_push?.device_push_token) {
    const sellerPayload: NotificationPayload = {
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
        `notification_workflow_seller_${order_info.order_id}_${toUTCDate(new Date())}`,
        JSON.stringify(sellerPayload)
      ).catch((err) => {
        createErrorRollbarReport(
          "Flutterwave webhook processing - Seller notification",
          err,
          500
        );
      })
    );
  }

  if (jobs.length > 0) {
    Promise.all(jobs).catch((err) => {
      createErrorRollbarReport(
        "Flutterwave webhook processing - Notifications",
        err,
        500
      );
    });
  }
}

/* ----------------------------- Core handler -------------------------------- */

async function handlePurchaseTransaction(
  verified_transaction: any,
  reqBody: any
) {
  const metaParse = MetaSchema.safeParse(
    verified_transaction?.data?.meta ?? null
  );
  if (!metaParse.success) return NextResponse.json({ status: 400 });

  await connectMongoDB();

  const meta = metaParse.data;

  const order_info = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  });

  if (!order_info) return NextResponse.json({ status: 200 });
  const flwStatus = String(verified_transaction.data.status).toLowerCase();

  if (shouldExitEarly(flwStatus, verified_transaction, reqBody)) {
    if (flwStatus === "failed") {
      await fireAndForget(
        sendPaymentFailedMail({
          email: meta.buyer_email,
          name: order_info.buyer_details.name,
          artwork: order_info.artwork_data.title,
        })
      );
    }
    return NextResponse.json({ status: 200 });
  }

  // Check idempotency: has this transaction been processed successfully before?
  const [existingTransaction, existingPaymentLedger] = await Promise.all([
    PurchaseTransactions.exists({
      trans_reference: verified_transaction.data.id,
    }),
    PaymentLedger.exists({
      provider: "flutterwave",
      provider_tx_id: verified_transaction.data.id,
      payment_fulfillment_checks_done: true,
    }),
  ]);

  if (existingTransaction || existingPaymentLedger) {
    await PurchaseTransactions.updateOne(
      { trans_reference: verified_transaction.data.id },
      { $set: { webhookReceivedAt: new Date(), webhookConfirmed: true } }
    );
    return NextResponse.json({ status: 200 });
  }

  const paymentObj = {
    status: verified_transaction.data.status,
    amount: verified_transaction.data.amount,
    id: verified_transaction.data.id,
  };
  // Create an Idempotent payment entry ledger entry immediately
  const paymentLedgerData = {
    provider: "flutterwave",
    provider_tx_id: String(verified_transaction.data.id),
    status: String(verified_transaction.data.status),
    payment_date: toUTCDate(new Date()),
    order_id: order_info.order_id,
    payload: { provider: "flutterwave", meta, paymentObj },
    amount: Math.round(Number(verified_transaction.data.amount)),
    currency: String(verified_transaction.data.currency),
    payment_fulfillment: {
      transaction_created: "failed",
      sale_record_created: "failed",
      artwork_marked_sold: "failed",
      mass_orders_updated: "failed",
      seller_wallet_updated: "failed",
    },
  };

  try {
    await retry(
      () =>
        PaymentLedger.updateOne(
          {
            provider: "flutterwave",
            provider_tx_id: verified_transaction.data.id,
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
      context: "Flutterwave Webhook",
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

  // Update order with payment information before proceeding
  const nowUTC = toUTCDate(new Date());

  const payment_information: PaymentStatusTypes = {
    status: "completed",
    transaction_value: Math.round(Number(verified_transaction.data.amount)),
    transaction_date: nowUTC,
    transaction_reference: verified_transaction.data.id,
  };

  // Update order with payment information
  const updateOrder = await CreateOrder.updateOne(
    { order_id: order_info.order_id },
    { $set: { payment_information, hold_status: null } }
  );

  if (updateOrder.modifiedCount === 0) {
    rollbarServerInstance.error({
      context: "Flutterwave Webhook",
      formatted_date: getFormattedDateTime(),
      message: "Order update failed",
    });
    return NextResponse.json(
      { message: "Order update unsuccessful" },
      { status: 400 }
    );
  }

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
    currency: "USD",
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
      total: Math.round(Number(verified_transaction.data.amount)),
      discount: 0,
    },
    paidAt: toUTCDate(new Date()),
  };

  try {
    // Create DB update workflow

    await fireAndForget(
      createWorkflow(
        "/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
        `flw_payment_workflow_${paymentObj.id}_${toUTCDate(new Date())}`,
        JSON.stringify({
          provider: "flutterwave",
          meta,
          verified_transaction: paymentObj,
        })
      )
    );
    // Create shipment workflow
    await fireAndForget(
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${order_info.order_id}_${toUTCDate(new Date())}`,
        JSON.stringify({ order_id: order_info.order_id })
      )
    );

    await fireAndForget(
      createWorkflow(
        "/api/workflows/emails/sendPaymentInvoice",
        `send_payment_invoice${invoice.invoiceNumber}_${toUTCDate(new Date())}`,
        JSON.stringify({
          invoice,
        })
      )
    );

    // Send email notifications

    await fireAndForget(
      createWorkflow(
        "/api/workflows/emails/sendPaymentSuccessMail",
        `send_payment_success_mail_${order_info.order_id}_${toUTCDate(new Date())}`,
        JSON.stringify({
          buyer_email: order_info.buyer_details.email,
          buyer_name: order_info.buyer_details.name,
          artwork_title: order_info.artwork_data.title,
          order_id: order_info.order_id,
          order_date: order_info.createdAt,
          transaction_id: verified_transaction.data.id,
          price: formatPrice(Math.round(Number(meta.unit_price)), "USD"),
          seller_email: order_info.seller_details.email,
          seller_name: order_info.seller_details.name,
          seller_entity: "artist",
        })
      )
    );

    // Send notifications
    await fireAndForget(sendPushNotifications(order_info));

    return NextResponse.json({ status: 200 });
  } catch {
    return NextResponse.json({ status: 400 });
  }
}

/* ----------------------------- Route -------------------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    const signature = request.headers.get("verif-hash");
    const secret = process.env.FLW_SECRET_HASH ?? "";

    if (!verifyWebhookSignature(signature, secret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (body.event === "charge.completed") {
      const verified = await fetch(
        `https://api.flutterwave.com/v3/transactions/${body.data.id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          },
        }
      ).then((r) => r.json());

      return await handlePurchaseTransaction(verified, body);
    }

    return NextResponse.json({ status: 200 });
  } catch (err) {
    createErrorRollbarReport(
      "Flutterwave webhook processing - fatal error",
      err as any,
      500
    );
    return NextResponse.json({ status: 200 });
  }
});
