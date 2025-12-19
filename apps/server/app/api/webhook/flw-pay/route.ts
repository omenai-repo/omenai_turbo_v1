// apps/server/app/api/webhooks/flutterwave/purchase/route.ts

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";

import {
  NotificationPayload,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";

import { z } from "zod";

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
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
import { redis } from "@omenai/upstash-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";

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

async function fireAndForget(p: Promise<unknown>) {
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

function shouldExitEarly(
    flwStatus: string,
    verified: any,
    body: any
): boolean {
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

function buildPricing(meta: any, artist: any) {
  const { isBreached, incident_count } = artist.exclusivity_uphold_status;

  const penalty_rate = (10 * Math.min(incident_count, 6)) / 100;
  const penalty_fee = isBreached
      ? penalty_rate * Number(meta.unit_price ?? 0)
      : 0;

  const commission = Math.round(0.35 * Number(meta.unit_price ?? 0));

  return { penalty_fee, commission };
}

async function sendPushNotifications(order_info: any) {
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

/* ----------------------------- Core handler -------------------------------- */

async function handlePurchaseTransaction(
    verified_transaction: any,
    reqBody: any
) {
  const metaParse = MetaSchema.safeParse(
      verified_transaction?.data?.meta ?? null
  );
  if (!metaParse.success) return NextResponse.json({ status: 200 });

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

  const client = await connectMongoDB();
  const session = await client.startSession();

  try {
    await CreateOrder.updateOne(
        { order_id: order_info.order_id },
        { $set: { hold_status: null } }
    ).session(session);

    const artist = await AccountArtist.findOne(
        { artist_id: meta.seller_id },
        "exclusivity_uphold_status"
    ).session(session);

    session.startTransaction();

    const existing = await PurchaseTransactions.findOne({
      trans_reference: verified_transaction.data.id,
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      await PurchaseTransactions.updateOne(
          { trans_reference: verified_transaction.data.id },
          { $set: { webhookReceivedAt: new Date(), webhookConfirmed: true } }
      );
      return NextResponse.json({ status: 200 });
    }

    const { penalty_fee, commission } = buildPricing(meta, artist);
    const nowUTC = toUTCDate(new Date());

    const pricing: PurchaseTransactionPricing = {
      amount_total: Math.round(Number(verified_transaction.data.amount)),
      unit_price: Math.round(Number(meta.unit_price ?? 0)),
      shipping_cost: Math.round(Number(meta.shipping_cost ?? 0)),
      commission,
      tax_fees: Math.round(Number(meta.tax_fees ?? 0)),
      currency: "USD",
      penalty_fee: Math.round(penalty_fee),
    };

    const walletIncrement =
        pricing.amount_total -
        (commission +
            penalty_fee +
            pricing.tax_fees +
            pricing.shipping_cost);

    const transaction: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
      trans_pricing: pricing,
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

    const { month, year } = getCurrentMonthAndYear();

    await Promise.all([
      PurchaseTransactions.create([transaction], { session }),
      Wallet.updateOne(
          { owner_id: meta.seller_id },
          { $inc: { pending_balance: walletIncrement } }
      ).session(session),
      Artworkuploads.updateOne(
          { art_id: meta.art_id },
          { $set: { availability: false } }
      ).session(session),
      SalesActivity.create(
          [
            {
              month,
              year,
              value: meta.unit_price,
              id: meta.seller_id,
              trans_ref: transaction.trans_reference,
            },
          ],
          { session }
      ),
    ]);

    await session.commitTransaction();

    try {
      await redis.set(
          `artwork:${meta.art_id}`,
          JSON.stringify({ availability: false })
      );
    } catch (e: any) {
      rollbarServerInstance.error(e);
    }

     await fireAndForget(
         createWorkflow(
            "/api/workflows/shipment/create_shipment",
            `create_shipment_${generateDigit(6)}`,
            JSON.stringify({ order_id: order_info.order_id })
        )
    );

   await fireAndForget(sendPushNotifications(order_info));

    return NextResponse.json({ status: 200 });
  } catch {
    await session.abortTransaction();
    return NextResponse.json({ status: 200 });
  } finally {
    await session.endSession();
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
