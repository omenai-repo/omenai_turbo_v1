import { NextResponse } from "next/server";
import { z } from "zod";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  PaymentStatusTypes,
  NotificationPayload,
  InvoiceTypes,
} from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { buildPricing, createErrorRollbarReport } from "../../util";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

/* -------------------------------- Schema -------------------------------- */

const MetaSchema = z.object({
  buyer_email: z.email(),
  buyer_id: z.string().optional(),
  seller_id: z.string().optional(),
  seller_designation: z.string().optional(),
  art_id: z.string().optional(),
  unit_price: z.union([z.string(), z.number()]).optional(),
  shipping_cost: z.union([z.string(), z.number()]).optional(),
  tax_fees: z.union([z.string(), z.number()]).optional(),
  type: z.string().optional(),
});

/* ------------------------------ Helpers ---------------------------------- */

async function verifyFlutterwaveTransaction(transactionId: string) {
  const key = process.env.FLW_TEST_SECRET_KEY;
  if (!key) throw new Error("Flutterwave secret key not configured");

  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => null);
    throw new Error(
      `Flutterwave verification failed: ${res.status} ${body || ""}`,
    );
  }

  return res.json();
}

async function sendNotifications(order_info: any) {
  const buyer_push = await DeviceManagement.findOne(
    { auth_id: order_info.buyer_details.id },
    "device_push_token",
  );

  const seller_push = await DeviceManagement.findOne(
    { auth_id: order_info.seller_details.id },
    "device_push_token",
  );

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
        `notification_buyer_${order_info.order_id}_workflow`,
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
        `notification_seller_${order_info.order_id}_workflow`,
        JSON.stringify(payload),
      ),
    );
  }

  if (jobs.length) {
    Promise.all(jobs).catch(() => {});
  }
}

export async function fireAndForget(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    createErrorRollbarReport(
      "Flutterwave webhook fire-and-forget error",
      err as any,
      500,
    );
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100,
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise(
          (res) => setTimeout(res, delayMs * attempt), // simple backoff
        );
      }
    }
  }

  throw lastError;
}
/* ------------------------------ Route ------------------------------------ */

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const data = await request.json();

    if (!data.transaction_id) {
      return NextResponse.json(
        { ok: false, success: false, message: "Transaction ID is required" },
        { status: 400 },
      );
    }

    /* 1️⃣ Verify with Flutterwave */
    const verified_transaction = await verifyFlutterwaveTransaction(
      data.transaction_id,
    );
    const metaParse = MetaSchema.safeParse(
      verified_transaction?.data?.meta ?? null,
    );
    if (!metaParse.success) {
      rollbarServerInstance.error({
        context: "Invalid transaction metadata",
        transaction_id: data.transaction_id,
      });

      return NextResponse.json({ ok: true, success: false }, { status: 200 });
    }

    const meta = metaParse.data;

    const [order_info, artist] = await Promise.all([
      CreateOrder.findOne({
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
        "order_accepted.status": "accepted",
      }),
      AccountArtist.findOne(
        { artist_id: meta.seller_id },
        "exclusivity_uphold_status",
      ),
    ]);

    if (!order_info)
      return NextResponse.json(
        { message: "Order not found. Please contact support", success: false },
        { status: 400 },
      );

    const flwStatus = String(verified_transaction.data.status).toLowerCase();

    if (flwStatus !== "successful") {
      await fireAndForget(
        sendPaymentFailedMail({
          email: meta.buyer_email,
          name: order_info.buyer_details.name,
          artwork: order_info.artwork_data.title,
        }),
      );
      return NextResponse.json(
        {
          success: false,
          status: flwStatus,
          message: `Payment transaction ${flwStatus}`,
        },
        { status: 400 },
      );
    }

    const nowUTC = toUTCDate(new Date());
    if (order_info.payment_information?.status === "completed") {
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
        { $set: { verifiedAt: toUTCDate(new Date()) } },
      );
      return NextResponse.json(
        {
          message: "Transaction already processed successfully",
          status: flwStatus,
        },
        { status: 200 },
      );
    }

    const paymentObj = {
      status: verified_transaction.data.status,
      amount: verified_transaction.data.amount,
      id: verified_transaction.data.id,
    };

    const paymentLedgerData = {
      provider: "flutterwave",
      provider_tx_id: String(verified_transaction.data.id),
      status: flwStatus,
      payment_date: toUTCDate(new Date()),
      payload: { meta, provider: "flutterwave", paymentObj },
      amount: Math.round(Number(verified_transaction.data.amount)),
      currency: String(verified_transaction.data.currency),
      payment_fulfillment: {},
    };

    let result;
    try {
      result = await retry(
        () =>
          PaymentLedger.updateOne(
            {
              provider: "flutterwave",
              provider_tx_id: verified_transaction.data.id,
            },
            {
              $setOnInsert: paymentLedgerData,
            },
            { upsert: true }, // Atomically safe
          ),
        3,
        150,
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
        { status: 400 },
      );
    }

    if (result.upsertedCount === 0) {
      console.log("Transaction already processed (caught by atomic upsert).");
      return NextResponse.json({ status: 200 });
    }

    const { penalty_fee, commission } = buildPricing(
      meta,
      artist.exclusivity_uphold_status,
    );
    const wallet_increment_amount = Math.round(
      Number(verified_transaction.data.amount) -
        (commission +
          penalty_fee +
          Number(meta.tax_fees ?? 0) +
          Number(meta.shipping_cost ?? 0)),
    );

    const payment_information: PaymentStatusTypes = {
      status: "completed",
      transaction_value: Math.round(Number(verified_transaction.data.amount)),
      transaction_date: nowUTC,
      transaction_reference: verified_transaction.data.id,
      artist_wallet_increment: wallet_increment_amount,
    };

    const updateOrder = await CreateOrder.updateOne(
      { order_id: order_info.order_id },
      { $set: { payment_information, hold_status: null } },
    );

    if (updateOrder.modifiedCount === 0) {
      rollbarServerInstance.error({
        context: "Order update failed",
        formatted_date: getFormattedDateTime(),
      });

      return NextResponse.json(
        {
          message:
            "We’re having trouble updating your order, but your payment is safe.We’ll keep retrying automatically — please don’t make another payment. If this continues, contact support for help",
          success: false,
        },
        { status: 200 },
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

    /* 6️⃣ Trigger fulfillment workflow (wallet, artwork, sales, etc.) */
    await fireAndForget(
      createWorkflow(
        "/api/workflows/payment/handleArtworkPaymentUpdatesByFlw",
        `flw_payment_workflow_${verified_transaction.data.id}_workflow`,
        JSON.stringify({
          provider: "flutterwave",
          meta: { ...meta, order_id: order_info.order_id },
          verified_transaction,
        }),
      ),
    );

    // Create shipment workflow
    await fireAndForget(
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${order_info.order_id}_workflow`,
        JSON.stringify({ order_id: order_info.order_id }),
      ),
    );

    await fireAndForget(
      createWorkflow(
        "/api/workflows/emails/sendPaymentSuccessMail",
        `send_payment_success_mail_${order_info.order_id}_workflow`,
        JSON.stringify({
          buyer_email: order_info.buyer_details.email,
          buyer_name: order_info.buyer_details.name,
          artwork_title: order_info.artwork_data.title,
          order_id: order_info.order_id,
          order_date: order_info.createdAt,
          transaction_id: verified_transaction.data.id,
          price: verified_transaction.data.amount,
          seller_email: order_info.seller_details.email,
          seller_name: order_info.seller_details.name,
          seller_entity: "artist",
        }),
      ),
    );

    await fireAndForget(
      createWorkflow(
        "/api/workflows/emails/sendPaymentInvoice",
        `send_payment_invoice${invoice.invoiceNumber}_workflow`,
        JSON.stringify({
          invoice,
        }),
      ),
    );

    // Send notifications
    await fireAndForget(sendNotifications(order_info));

    return NextResponse.json({
      success: true,
      status: "completed",
      order_id: order_info.order_id,
    });
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "transactions: verify Flutterwave transaction",
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
