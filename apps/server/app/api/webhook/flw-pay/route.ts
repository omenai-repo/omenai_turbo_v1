import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { NotificationPayload, PaymentStatusTypes } from "@omenai/shared-types";
import { z } from "zod";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { createErrorRollbarReport } from "../../util";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
/* ----------------------------- Schema ------------------------------------- */

const MetaSchema = z.object({
  buyer_email: z.email(),
  buyer_id: z.string().optional(),
  seller_id: z.string().optional(),
  seller_designation: z.string().optional(),
  art_id: z.string().optional(),
  unit_price: z.union([z.string(), z.number()]).optional(),
  shipping_cost: z.union([z.string(), z.number()]).optional(),
  tax_fees: z.union([z.string(), z.number()]).optional(),
});

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
        `notification_workflow_buyer_${order_info.order_id}_${generateDigit(2)}`,
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
        `notification_workflow_seller_${order_info.order_id}_${generateDigit(2)}`,
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

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise(
          (res) => setTimeout(res, delayMs * attempt) // simple backoff
        );
      }
    }
  }

  throw lastError;
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
  const existing = await PurchaseTransactions.findOne({
    trans_reference: String(verified_transaction.data.id),
  });

  if (existing) {
    await PurchaseTransactions.updateOne(
      { trans_reference: String(verified_transaction.data.id) },
      { $set: { webhookReceivedAt: new Date(), webhookConfirmed: true } }
    );
    return NextResponse.json({ status: 200 });
  }

  // Create an Idempotent payment entry ledger entry immediately
  const paymentLedgerData = {
    provider: "flutterwave",
    provider_tx_id: String(verified_transaction.data.id),
    status: String(verified_transaction.data.status),
    payment_date: toUTCDate(new Date()),
    payload: { meta },
    amount: Math.round(Number(verified_transaction.data.amount)),
    currency: String(verified_transaction.data.currency),
    payment_fulfillment: {},
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

  try {
    // Create DB update workflow

    await fireAndForget(
      createWorkflow(
        "/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
        `flw_payment_workflow_${verified_transaction.data.id}`,
        JSON.stringify({
          provider: "flutterwave",
          meta,
          verified_transaction,
        })
      )
    );
    // Create shipment workflow
    await fireAndForget(
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${order_info.order_id}`,
        JSON.stringify({ order_id: order_info.order_id })
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
