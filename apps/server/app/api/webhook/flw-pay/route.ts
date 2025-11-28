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
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { createErrorRollbarReport } from "../../util";

/* ----------------------------- Config & schemas --------------------------- */

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

/* -------------------------- Utility / helpers ------------------------------ */

function verifyWebhookSignature(
  headerHash: string | null | undefined,
  secret: string
): boolean {
  if (!headerHash || !secret) {
    return false;
  }

  try {
    const a = Buffer.from(headerHash, "utf8");
    const b = Buffer.from(secret, "utf8");

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return false;
  }
}

async function fireAndForget(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    createErrorRollbarReport(
      "Flutterwave webhook processing - Webhook handler - Fire and forget fn",
      err as any,
      500
    );
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

async function handlePurchaseTransaction(
  verified_transaction: any,
  reqBody: any
) {
  const metaRaw = verified_transaction?.data?.meta ?? null;
  const metaParse = MetaSchema.safeParse(metaRaw);

  if (!metaParse.success) {
    console.error(
      "[webhook][purchase] invalid meta:",
      metaParse.error.format()
    );
    return NextResponse.json({ status: 200 });
  }

  const meta = metaParse.data;

  // Find the order
  const order_info = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  });

  if (!order_info) {
    console.error("[webhook][purchase] order not found for meta:", { meta });
    return NextResponse.json({ status: 200 });
  }

  const flwStatus = String(verified_transaction.data.status).toLowerCase();

  // Handle failed/pending
  if (flwStatus === "failed") {
    try {
      await sendPaymentFailedMail({
        email: meta.buyer_email,
        name: order_info.buyer_details.name,
        artwork: order_info.artwork_data.title,
      });
    } catch (err) {
      createErrorRollbarReport(
        "Flutterwave webhook processing - sendPaymentFailedMail",
        err as any,
        500
      );
      console.error("[webhook][email] sendPaymentFailedMail failed:", err);
    }
    return NextResponse.json({ status: 200 });
  }

  if (flwStatus === "pending") {
    return NextResponse.json({ status: 200 });
  }

  // Verify tx_ref, amount, currency match
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
    return NextResponse.json({ status: 200 });
  }

  // Connect to MongoDB and get session
  const client = await connectMongoDB();
  const session = await client.startSession();

  try {
    // Clear hold_status (non-transactional operation)

    await CreateOrder.updateOne(
      { order_id: order_info.order_id, "order_accepted.status": "accepted" },
      { $set: { hold_status: null } }
    ).session(session);

    const artist = await AccountArtist.findOne(
      { artist_id: meta.seller_id },
      "exclusivity_uphold_status"
    ).session(session);

    // if (!artist) {
    //   throw new Error("Artist account not found");
    // }

    session.startTransaction();

    // Idempotency check
    const existingTransaction = await PurchaseTransactions.findOne({
      trans_reference: verified_transaction.data.id,
    }).session(session);

    if (existingTransaction) {
      await session.abortTransaction();
      console.info(
        "[webhook][purchase] transaction already exists (likely processed by verification):",
        verified_transaction.data.id
      );

      // Update webhook timestamp outside transaction
      await PurchaseTransactions.updateOne(
        { trans_reference: verified_transaction.data.id },
        { $set: { webhookReceivedAt: new Date(), webhookConfirmed: true } }
      );

      return NextResponse.json({ status: 200 });
    }

    const { isBreached, incident_count } = artist.exclusivity_uphold_status;

    // Build pricing
    const penalty_rate = (10 * (incident_count < 6 ? incident_count : 6)) / 100; // 10% per incident
    const penalty_fee = isBreached
      ? penalty_rate * Number(meta.unit_price ?? 0)
      : 0;

    // Build pricing
    const commission = Math.round(0.35 * Number(meta.unit_price ?? 0));
    const nowUTC = toUTCDate(new Date());

    const transaction_pricing: PurchaseTransactionPricing = {
      amount_total: Math.round(Number(verified_transaction.data.amount)),
      unit_price: Math.round(Number(meta.unit_price ?? 0)),
      shipping_cost: Math.round(Number(meta.shipping_cost ?? 0)),
      commission,
      tax_fees: Math.round(Number(meta.tax_fees ?? 0)),
      currency: "USD",
      penalty_fee: Math.round(penalty_fee),
    };

    const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
      trans_pricing: transaction_pricing,
      trans_date: nowUTC,
      trans_recipient_id: meta.seller_id ?? "",
      trans_initiator_id: meta.buyer_id ?? "",
      trans_recipient_role: "artist",
      trans_reference: verified_transaction.data.id,
      status: verified_transaction.data.status,
      createdBy: "webhook",
      webhookReceivedAt: new Date(),
      webhookConfirmed: true,
    };

    const wallet_increment_amount = Math.round(
      Number(verified_transaction.data.amount) -
        (commission +
          penalty_fee +
          Number(meta.tax_fees ?? 0) +
          Number(meta.shipping_cost ?? 0))
    );

    const formatted_date = getFormattedDateTime();

    const createTransactionPromise = PurchaseTransactions.create([data], {
      session,
    });

    const updateOrderPromise = CreateOrder.updateOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
        "order_accepted.status": "accepted",
      },
      {
        $set: {
          payment_information: {
            status: "completed",
            transaction_value: Number(verified_transaction.data.amount),
            transaction_date: formatted_date,
            transaction_reference: verified_transaction.data.id,
            artist_wallet_increment: wallet_increment_amount,
          } as PaymentStatusTypes,
        },
      }
    ).session(session);

    const updateArtworkPromise = Artworkuploads.updateOne(
      { art_id: meta.art_id },
      { $set: { availability: false } }
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

    const fundWalletPromise = Wallet.updateOne(
      { owner_id: meta.seller_id },
      { $inc: { pending_balance: wallet_increment_amount } }
    ).session(session);

    const revertExclusivityPromise = await AccountArtist.updateOne(
      { artist_id: meta.seller_id },
      {
        $set: {
          "exclusivity_uphold_status.isBreached": false,
          "exclusivity_uphold_status.incident_count": 0,
        },
      }
    ).session(session);

    const [createTransactionResult] = await Promise.all([
      createTransactionPromise,
      updateOrderPromise,
      updateArtworkPromise,
      createSalesActivityPromise,
      updateManyOrdersPromise,
      fundWalletPromise,
      revertExclusivityPromise,
    ]);

    await session.commitTransaction();

    const transaction_id =
      Array.isArray(createTransactionResult) &&
      createTransactionResult[0]?.trans_id
        ? createTransactionResult[0].trans_id
        : undefined;

    // Get push tokens
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
        ).catch((err) => {
          createErrorRollbarReport(
            "Flutterwave webhook processing - Webhook handler - Buyer notification",
            err as any,
            500
          );
        })
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
        ).catch((err) => {
          createErrorRollbarReport(
            "Flutterwave webhook processing - Webhook handler - Seller notification",
            err as any,
            500
          );
        })
      );
    }

    const priceFormatted = formatPrice(
      Number(verified_transaction.data.amount),
      "USD"
    );

    // Launch workflows (fire-and-forget)
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

    if (notificationPromises.length > 0) {
      Promise.all(notificationPromises).catch((err) => {
        createErrorRollbarReport(
          "Flutterwave webhook processing - Webhook handler  - Notifications",
          err as any,
          500
        );
      });
    }

    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.error("[webhook][purchase] transaction error:", err);
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      createErrorRollbarReport(
        "Flutterwave webhook processing - Webhook handler - Abort transaction",
        abortErr as any,
        500
      );
      console.error("[webhook][purchase] abort failed:", abortErr);
    }
    // Return 200 to prevent Flutterwave retries
    return NextResponse.json({ status: 200 });
  } finally {
    try {
      await session.endSession();
    } catch (endErr) {
      createErrorRollbarReport(
        "Flutterwave webhook processing - Webhook handler - End session",
        endErr as any,
        500
      );
      console.error("[webhook][purchase] endSession failed:", endErr);
    }
  }
}

/* ----------------------------- Route handler -------------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    // Verify webhook signature
    const headerSignature = request.headers.get("verif-hash");
    const secret = process.env.FLW_SECRET_HASH ?? "";

    if (!verifyWebhookSignature(headerSignature, secret)) {
      console.warn("[webhook] invalid signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 403 }
      );
    }

    // Parse webhook body
    const body = await request.json();

    if (body.event === "charge.completed") {
      // Verify the transaction server-side with Flutterwave
      const verified_transaction = await verifyFlutterwaveTransaction(
        body.data.id
      );

      // Determine transaction type
      const transactionType = verified_transaction?.data?.meta
        ? "purchase"
        : "subscription";

      if (transactionType === "purchase") {
        return await handlePurchaseTransaction(verified_transaction, body);
      } else {
        console.info("[webhook] subscription flow not implemented");
        return NextResponse.json({ status: 200 });
      }
    }

    // Other events: accept and return 200
    return NextResponse.json({ status: 200 });
  } catch (err) {
    createErrorRollbarReport(
      "Flutterwave webhook processing - Webhook handler",
      err as any,
      500
    );
    console.error("[webhook] fatal error processing webhook:", err);
    // Always return 200 to prevent Flutterwave retries
    return NextResponse.json({ status: 400 });
  }
});
