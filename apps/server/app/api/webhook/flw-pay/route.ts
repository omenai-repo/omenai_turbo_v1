// apps/server/app/api/webhooks/flutterwave/purchase/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";

import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";

import { z } from "zod";

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";

import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";

import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";

/* ----------------------------- Config & schemas --------------------------- */

// minimal shape expected from FLW webhook body (we validate fields we use)
const FlwWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.string(),
    tx_ref: z.string().optional(),
    amount: z.union([z.string(), z.number()]).transform(String),
    currency: z.string(),
    status: z.string(),
    meta: z
      .any()
      .optional()
      .refine(
        (m) => m !== undefined && m !== null,
        "meta must exist for purchase"
      ),
  }),
});

// the meta fields we rely on
const MetaSchema = z.object({
  buyer_email: z.string().email(),
  buyer_id: z.string().optional(),
  seller_id: z.string().optional(),
  seller_designation: z.string().optional(),
  art_id: z.string().optional(),
  unit_price: z.union([z.string(), z.number()]).optional(),
  shipping_cost: z.union([z.string(), z.number()]).optional(),
  tax_fees: z.union([z.string(), z.number()]).optional(),
});

/* -------------------------- Utility / helpers ------------------------------ */

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Verify Flutterwave webhook by computing HMAC-SHA256 over raw body using secret.
 * Compare to header value using timingSafeEqual.
 */
function verifyWebhookSignature(
  rawBody: string,
  headerSignature: string | null,
  secret: string
): boolean {
  if (!headerSignature || !secret) return false;
  // compute expected signature
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(hmac, "utf8");
  const b = Buffer.from(headerSignature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Wraps async side-effects so they don't crash the request; log errors. */
async function fireAndForget(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    console.error("[webhook][background-task] failure:", err);
  }
}

/* ---------------------------- Business logic ------------------------------- */

async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<any> {
  const key = process.env.FLW_TEST_SECRET_KEY;
  if (!key) throw new Error("FLW secret key not configured");
  const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => null);
    const message = `flutterwave verification failed: ${res.status} ${res.statusText}`;
    console.error("[webhook][flw-verify] ", message, body ?? "");
    throw new Error(message);
  }
  return await res.json();
}

/**
 * Main handler for purchase transactions. Expects validated verified_transaction (as returned from FLW verify),
 * webhook request original payload (req), and an active mongoose session.
 */
async function handlePurchaseTransaction(
  verified_transaction: any,
  reqBody: any,
  session: any
) {
  const metaRaw = verified_transaction?.data?.meta ?? null;
  const metaParse = MetaSchema.safeParse(metaRaw);
  if (!metaParse.success) {
    console.error(
      "[webhook][purchase] invalid meta:",
      metaParse.error.format()
    );
    // we intentionally return 200 to webhook provider to avoid retries for malformed requests
    return NextResponse.json({ status: 200 });
  }
  const meta = metaParse.data;

  // find the order
  const order_info = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
  });

  if (!order_info) {
    console.error("[webhook][purchase] order not found for meta:", { meta });
    // still return 200 so FLW doesn't keep retrying garbage payloads
    return NextResponse.json({ status: 200 });
  }

  const flwStatus = String(verified_transaction.data.status).toLowerCase();

  // handle failed/pending quickly
  if (flwStatus === "failed") {
    try {
      await sendPaymentFailedMail({
        email: meta.buyer_email,
        name: order_info.buyer_details.name,
        artwork: order_info.artwork_data.title,
      });
    } catch (err) {
      console.error("[webhook][email] sendPaymentFailedMail failed:", err);
    }
    return NextResponse.json({ status: 200 });
  }

  if (flwStatus === "pending") {
    return NextResponse.json({ status: 200 });
  }

  // successful branch: double-check tx_ref, amount, currency match
  const tv = String(verified_transaction.data.tx_ref ?? "");
  const req_tx_ref = String(reqBody?.data?.tx_ref ?? "");
  const verifiedAmount = String(verified_transaction.data.amount ?? "");
  const reqAmount = String(reqBody?.data?.amount ?? "");
  const verifiedCurrency = String(verified_transaction.data.currency ?? "");
  const reqCurrency = String(reqBody?.data?.currency ?? "");

  if (
    !(
      flwStatus === "successful" &&
      tv &&
      tv === req_tx_ref &&
      verifiedAmount === reqAmount &&
      verifiedCurrency === reqCurrency
    )
  ) {
    console.error("[webhook][purchase] verification mismatch", {
      flwStatus,
      tv,
      req_tx_ref,
      verifiedAmount,
      reqAmount,
      verifiedCurrency,
      reqCurrency,
    });
    // return 200 (we don't want retries on mismatch; treat as processed but logged)
    return NextResponse.json({ status: 200 });
  }

  // Now perform DB transactional work
  const nowUTC = toUTCDate(new Date());
  const formatted_date = getFormattedDateTime();
  const currencySymbol = getCurrencySymbol("USD");

  // Clear hold_status on order (non-transactional operation ok to run within session)
  await CreateOrder.updateOne(
    { order_id: order_info.order_id },
    { $set: { hold_status: null } }
  ).session(session);

  // Start mongoose transaction (caller should have started session and passed it here)
  try {
    session.startTransaction();

    // idempotency: has purchase transaction with same transaction id already been stored?
    const existingTransaction = await PurchaseTransactions.findOne({
      trans_reference: verified_transaction.data.id,
    }).session(session);

    if (existingTransaction) {
      await session.abortTransaction();
      console.info(
        "[webhook][purchase] transaction already exists:",
        verified_transaction.data.id
      );
      return NextResponse.json({ status: 200 });
    }

    // build pricing
    const commission = Math.round(
      0.5 * Number(meta.unit_price ?? 0) +
        Number(meta.shipping_cost ?? 0) +
        Number(meta.tax_fees ?? 0)
    );

    const transaction_pricing: PurchaseTransactionPricing = {
      amount_total: Math.round(Number(verified_transaction.data.amount)),
      unit_price: Math.round(Number(meta.unit_price ?? 0)),
      shipping_cost: Math.round(Number(meta.shipping_cost ?? 0)),
      commission,
      tax_fees: Math.round(Number(meta.tax_fees ?? 0)),
    };

    const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
      trans_pricing: transaction_pricing,
      trans_date: nowUTC,
      trans_recipient_id: meta.seller_id ?? "",
      trans_initiator_id: meta.buyer_id ?? "",
      trans_recipient_role: "artist",
      trans_reference: verified_transaction.data.id,
      status: verified_transaction.data.status,
    };

    // prepare promises that should run in the transaction
    const createTransactionPromise = PurchaseTransactions.create([data], {
      session,
    });

    const updateArtworkPromise = Artworkuploads.updateOne(
      { art_id: meta.art_id },
      { $set: { availability: false } }
    ).session(session);

    const updateOrderPromise = CreateOrder.updateOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
      },
      {
        $set: {
          payment_information: {
            status: "completed",
            transaction_value: formatPrice(
              Number(verified_transaction.data.amount),
              "USD"
            ),
            transaction_date: formatted_date,
            transaction_reference: verified_transaction.data.id,
          } as PaymentStatusTypes,
        },
      }
    ).session(session);

    const { month, year } = getCurrentMonthAndYear();
    const activity = {
      month,
      year,
      value: meta.unit_price,
      id: meta.seller_id,
      trans_ref: data.trans_reference,
    };

    const createSalesActivityPromise = SalesActivity.create([activity], {
      session,
    });

    const updateManyOrdersPromise = CreateOrder.updateMany(
      {
        "artwork_data.art_id": meta.art_id,
        "buyer_details.id": { $ne: meta.buyer_id },
      },
      { $set: { availability: false } }
    ).session(session);

    // update wallet (non-session write is acceptable but better to include in session)
    const wallet_increment_amount = Math.round(
      Number(verified_transaction.data.amount) -
        (commission +
          Number(meta.tax_fees ?? 0) +
          Number(meta.shipping_cost ?? 0))
    );

    const fundWalletPromise = Wallet.updateOne(
      { owner_id: meta.seller_id },
      { $inc: { pending_balance: wallet_increment_amount } }
    ).session(session);

    // run all transactional ops in parallel
    const [createTransactionResult] = await Promise.all([
      createTransactionPromise,
      updateOrderPromise,
      updateArtworkPromise,
      createSalesActivityPromise,
      updateManyOrdersPromise,
      fundWalletPromise,
    ]);

    // commit
    await session.commitTransaction();

    // extract created transaction id for downstream uses (if provided by schema)
    const transaction_id =
      Array.isArray(createTransactionResult) &&
      createTransactionResult[0]?.trans_id
        ? createTransactionResult[0].trans_id
        : undefined;

    // After commit: create workflows / send email / notifications (fire-and-forget)
    // get push tokens
    const buyer_push = await DeviceManagement.findOne(
      { auth_id: order_info.buyer_details.id },
      "device_push_token"
    );

    const seller_push = await DeviceManagement.findOne(
      { auth_id: order_info.seller_details.id },
      "device_push_token"
    );

    const notificationPromises: Promise<unknown>[] = [];

    if (buyer_push?.device_push_token) {
      const buyer_notif_payload: NotificationPayload = {
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

      notificationPromises.push(
        createWorkflow(
          "/api/workflows/notification/pushNotification",
          `notification_workflow_buyer_${order_info.order_id}_${generateDigit(2)}`,
          JSON.stringify(buyer_notif_payload)
        ).catch((err) => console.error("[workflow][buyer-notif] failed:", err))
      );
    }

    if (seller_push?.device_push_token) {
      const seller_notif_payload: NotificationPayload = {
        to: seller_push.device_push_token,
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
        ).catch((err) => console.error("[workflow][seller-notif] failed:", err))
      );
    }

    const priceFormatted = formatPrice(
      Number(verified_transaction.data.amount),
      "USD"
    );

    // Launch shipment and email workflows concurrently; don't await here (fire-and-forget)
    fireAndForget(
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${generateDigit(6)}`,
        JSON.stringify({ order_id: order_info.order_id })
      )
    );

    fireAndForget(
      createWorkflow(
        "/api/workflows/emails/sendPaymentSuccessMail",
        `send_payment_success_mail${generateDigit(6)}`,
        JSON.stringify({
          buyer_email: order_info.buyer_details.email,
          buyer_name: order_info.buyer_details.name,
          artwork_title: order_info.artwork_data.title,
          order_id: order_info.order_id,
          order_date: order_info.createdAt,
          transaction_id,
          price: priceFormatted,
          seller_email: order_info.seller_details.email,
          seller_name: order_info.seller_details.name,
        })
      )
    );

    // also wait a short while for notification promises to be scheduled (they already have their own catches)
    if (notificationPromises.length > 0) {
      // allow them to run but don't block the webhook response excessively
      Promise.all(notificationPromises).catch((err) =>
        console.error("[workflow][notifications] errors:", err)
      );
    }

    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.error("[webhook][purchase] transaction error:", err);
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("[webhook][purchase] abort failed:", abortErr);
    }
    return NextResponse.json({ status: 400 });
  } finally {
    try {
      await session.endSession();
    } catch (endErr) {
      console.error("[webhook][purchase] endSession failed:", endErr);
    }
  }
}

/* ----------------------------- Route handler -------------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  // Read raw body text first (required for signature verification)
  const rawBody = await request.text().catch(() => "");
  const headerSignature = request.headers.get("verif-hash");
  const secret = process.env.FLW_SECRET_HASH ?? "";

  if (!verifyWebhookSignature(rawBody, headerSignature, secret)) {
    console.warn("[webhook] invalid signature");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 }
    );
  }

  const parsed = safeJsonParse(rawBody);
  if (!parsed) {
    console.error("[webhook] invalid json body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsedWebhook = FlwWebhookSchema.safeParse(parsed);
  if (!parsedWebhook.success) {
    console.error(
      "[webhook] webhook payload validation failed:",
      parsedWebhook.error.format()
    );
    // respond 200 to avoid retries for malformed events; log for later inspection
    return NextResponse.json({ status: 200 });
  }

  const body = parsedWebhook.data;

  if (body.event === "charge.completed") {
    try {
      // verify the transaction server-side with FLW (ensures canonical state)
      const verified_transaction = await verifyFlutterwaveTransaction(
        body.data.id
      );

      // determine transaction type
      const transactionType = verified_transaction?.data?.meta
        ? "purchase"
        : "subscription";

      // connect mongodb & get session
      const client = await connectMongoDB();
      const session = await client.startSession();

      if (transactionType === "purchase") {
        // handle purchase (function will manage transaction/session end)
        return await handlePurchaseTransaction(
          verified_transaction,
          body,
          session
        );
      } else {
        // placeholder for subscription handling
        await session.endSession();
        console.info("[webhook] subscription flow not implemented here");
        return NextResponse.json({ status: 200 });
      }
    } catch (err) {
      console.error("[webhook] error processing charge.completed:", err);
      return NextResponse.json({ status: 500 });
    }
  }

  // other events: accept and return 200 so FLW doesn't retry repeatedly
  return NextResponse.json({ status: 200 });
});
