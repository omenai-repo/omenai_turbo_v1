// apps/server/app/api/verify-payment/route.ts

import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { z } from "zod";

import {
  ArtistSchemaTypes,
  CreateOrderModelTypes,
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";

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
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { createErrorRollbarReport } from "../../util";
import { redis } from "@omenai/upstash-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";

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
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => null);
    throw new Error(
      `Flutterwave verification failed: ${res.status} ${body || ""}`
    );
  }

  return res.json();
}

async function fireAndForget(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    console.error("[verification][background-task] failure:", err);
  }
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

async function sendNotifications(order_info: any) {
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
        `notification_buyer_${order_info.order_id}_${generateDigit(2)}`,
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
        `notification_seller_${order_info.order_id}_${generateDigit(2)}`,
        JSON.stringify(payload)
      )
    );
  }

  if (jobs.length) {
    Promise.all(jobs).catch(() => {});
  }
}

/* ----------------------- Core Purchase Processing ------------------------ */

async function processPurchaseTransaction(
  verified_transaction: any,
  source: "verification" | "webhook"
) {
  const metaParse = MetaSchema.safeParse(
    verified_transaction?.data?.meta ?? null
  );

  if (!metaParse.success) {
    throw new Error("Invalid transaction metadata");
  }

  const meta = metaParse.data;
  const flwStatus = String(verified_transaction.data.status).toLowerCase();
  const nowUTC = toUTCDate(new Date());

  const existing = await PurchaseTransactions.findOne({
    trans_reference: verified_transaction.data.id,
  });

  if (existing) {
    if (source === "webhook") {
      await PurchaseTransactions.updateOne(
        { trans_reference: verified_transaction.data.id },
        { $set: { webhookReceivedAt: new Date() } }
      );
    }
    return NextResponse.json({ status: 200 });
  }

  const [order_info, artist]: [
    CreateOrderModelTypes | null,
    ArtistSchemaTypes | null,
  ] = await Promise.all([
    CreateOrder.findOne({
      "buyer_details.email": meta.buyer_email,
      "artwork_data.art_id": meta.art_id,
      "order_accepted.status": "accepted",
    }),

    AccountArtist.findOne(
      { artist_id: meta.seller_id },
      "exclusivity_uphold_status"
    ),
  ]);

  if (!order_info || !artist) return NextResponse.json({ status: 200 });

  if (flwStatus !== "successful") {
    return {
      ok: true,
      success: false,
      status: flwStatus,
      message: `Payment transaction ${flwStatus}`,
    };
  }

  const client = await connectMongoDB();
  const session = await client.startSession();

  try {
    const nowUTC = toUTCDate(new Date());

    const payment_information: PaymentStatusTypes = {
      status: "completed",
      transaction_value: Math.round(Number(verified_transaction.data.amount)),
      transaction_date: nowUTC,
      transaction_reference: verified_transaction.data.id,
    };

    const updateOrder = await CreateOrder.updateOne(
      { order_id: order_info.order_id },
      { $set: { payment_information, hold_status: null } },
      { session }
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

    const { penalty_fee, commission } = buildPricing(meta, artist);
    session.startTransaction();
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
      (commission + penalty_fee + pricing.tax_fees + pricing.shipping_cost);

    const transaction: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
      trans_pricing: pricing,
      trans_date: nowUTC,
      trans_recipient_id: meta.seller_id ?? "",
      trans_initiator_id: meta.buyer_id ?? "",
      trans_recipient_role: "artist",
      trans_reference: verified_transaction.data.id,
      status: verified_transaction.data.status,
      createdBy: source,
      ...(source === "verification" && { verifiedAt: new Date() }),
      ...(source === "webhook" && { webhookReceivedAt: new Date() }),
    };

    const { month, year } = getCurrentMonthAndYear();

    const [_purchase, wallet, _sales] = await Promise.all([
      PurchaseTransactions.create([transaction], { session }),
      Wallet.updateOne(
        { owner_id: meta.seller_id },
        { $inc: { pending_balance: walletIncrement } }
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

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    await session.commitTransaction();

    try {
      const artwork = await Artworkuploads.findOneAndUpdate(
        { art_id: meta.art_id },
        { $set: { availability: false } },
        { new: true }
      ).session(session);
      await redis.set(`artwork:${meta.art_id}`, JSON.stringify(artwork));
    } catch (e: any) {
      rollbarServerInstance.error(e);
    }

    await fireAndForget(sendNotifications(order_info));
    await fireAndForget(
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${generateDigit(6)}`,
        JSON.stringify({ order_id: order_info.order_id })
      )
    );

    return {
      ok: true,
      success: true,
      status: "completed",
      order_id: order_info.order_id,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

/* ------------------------------ Route ------------------------------------ */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    const data = await request.json();

    if (!data.transaction_id) {
      return NextResponse.json(
        { ok: false, success: false, message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const verified = await verifyFlutterwaveTransaction(data.transaction_id);

    const result = await processPurchaseTransaction(verified, "verification");

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "transactions: verify Flutterwave transaction",
      error,
      errorResponse.status
    );

    return NextResponse.json(
      {
        ok: false,
        success: false,
        message: errorResponse.message || "Payment verification failed",
      },
      { status: errorResponse.status || 500 }
    );
  }
});
