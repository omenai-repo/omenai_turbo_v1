// apps/server/app/api/verify-payment/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { z } from "zod";

import {
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

/* ----------------------------- Schemas & Types --------------------------- */

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

/* ----------------------------- Helpers --------------------------- */

async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<any> {
  const key = process.env.FLW_TEST_SECRET_KEY;
  if (!key) {
    throw new Error("Flutterwave secret key not configured");
  }

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
    throw new Error(
      `Flutterwave verification failed: ${res.status} ${body || ""}`
    );
  }

  return await res.json();
}

async function fireAndForget(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    console.error("[verification][background-task] failure:", err);
  }
}

/* ----------------------------- Core Payment Processing --------------------------- */

async function processPurchaseTransaction(
  verified_transaction: any,
  source: "verification" | "webhook"
) {
  const metaRaw = verified_transaction?.data?.meta ?? null;
  const metaParse = MetaSchema.safeParse(metaRaw);
  const formatted_date = getFormattedDateTime();

  if (!metaParse.success) {
    console.error(`[${source}][purchase] invalid meta:`);
    throw new Error("Invalid transaction metadata");
  }

  const meta = metaParse.data;

  const flwStatus = String(verified_transaction.data.status).toLowerCase();

  // Find the order
  const order_info = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
  });

  if (!order_info) {
    console.error(`[${source}][purchase] order not found for meta:`, { meta });
    throw new Error("Order not found");
  }

  // Handle non-successful payments
  if (flwStatus === "failed") {
    await CreateOrder.updateOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
      },
      {
        $set: {
          payment_information: {
            status: "processing",
            transaction_value: Number(verified_transaction.data.amount),
            transaction_date: formatted_date,
            transaction_reference: verified_transaction.data.id,
          } as PaymentStatusTypes,
        },
      }
    );

    return {
      ok: true,
      success: false,
      status: "failed",
      message: "Payment transaction failed",
    };
  }

  if (flwStatus === "pending") {
    await CreateOrder.updateOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
      },
      {
        $set: {
          payment_information: {
            status: "processing",
            transaction_value: Number(verified_transaction.data.amount),
            transaction_date: formatted_date,
            transaction_reference: verified_transaction.data.id,
          } as PaymentStatusTypes,
        },
      }
    );
    return {
      ok: true,
      success: false,
      status: "pending",
      message: "Payment transaction is still pending",
    };
  }

  if (flwStatus !== "successful") {
    throw new Error(`Unexpected payment status: ${flwStatus}`);
  }

  // Connect to MongoDB and start session
  const client = await connectMongoDB();
  const session = await client.startSession();

  try {
    session.startTransaction();

    // Idempotency check: has this transaction already been processed?
    const existingTransaction = await PurchaseTransactions.findOne({
      trans_reference: verified_transaction.data.id,
    }).session(session);

    if (existingTransaction) {
      await session.abortTransaction();
      console.info(
        `[${source}][purchase] transaction already processed:`,
        verified_transaction.data.id
      );

      // If processed by verification, just update webhook timestamp
      if (source === "webhook") {
        // Update outside of transaction since we're aborting
        await PurchaseTransactions.updateOne(
          { trans_reference: verified_transaction.data.id },
          { $set: { webhookReceivedAt: new Date() } }
        );
      }

      return {
        ok: true,
        success: true,
        status: "completed",
        message: "Transaction already processed",
        order_id: order_info.order_id,
        alreadyProcessed: true,
      };
    }

    // Clear hold_status
    await CreateOrder.updateOne(
      { order_id: order_info.order_id },
      { $set: { hold_status: null } }
    ).session(session);

    const artist = await AccountArtist.findOne(
      { artist_id: meta.seller_id },
      "exclusivity_uphold_status"
    ).session(session);

    if (!artist) {
      throw new Error("Artist account not found");
    }

    const { isBreached, incident_count } = artist.exclusivity_uphold_status;

    // Build pricing
    const penalty_rate = (10 * (incident_count < 6 ? incident_count : 6)) / 100; // 10% per incident
    const penalty_fee = isBreached
      ? penalty_rate * Number(meta.unit_price ?? 0)
      : 0;
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

    const transactionData: Omit<
      PurchaseTransactionModelSchemaTypes,
      "trans_id"
    > = {
      trans_pricing: transaction_pricing,
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

    // Execute all DB operations in parallel

    const createTransactionPromise = PurchaseTransactions.create(
      [transactionData],
      {
        session,
      }
    );

    const updateArtworkPromise = Artworkuploads.updateOne(
      { art_id: meta.art_id },
      { $set: { availability: false } }
    ).session(session);

    const wallet_increment_amount = Math.round(
      Number(verified_transaction.data.amount) -
        (commission +
          penalty_fee +
          Number(meta.tax_fees ?? 0) +
          Number(meta.shipping_cost ?? 0))
    );

    const updateOrderPromise = CreateOrder.updateOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
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

    const { month, year } = getCurrentMonthAndYear();
    const activity = {
      month,
      year,
      value: meta.unit_price,
      id: meta.seller_id,
      trans_ref: transactionData.trans_reference,
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

    // Commit transaction
    await session.commitTransaction();

    const transaction_id =
      Array.isArray(createTransactionResult) &&
      createTransactionResult[0]?.trans_id
        ? createTransactionResult[0].trans_id
        : undefined;

    // Post-commit: Send notifications and emails (fire-and-forget)
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
        )
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
        )
      );
    }

    Promise.all(notificationPromises).catch((err) =>
      console.error("[verification][notifications] errors:", err)
    );

    const priceFormatted = formatPrice(
      Number(verified_transaction.data.amount),
      "USD"
    );

    // Fire-and-forget for shipment and email
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

    return {
      ok: true,
      success: true,
      status: "completed",
      message: "Payment processed successfully",
      order_id: order_info.order_id,
      transaction_id,
    };
  } catch (err) {
    console.error(`[${source}][purchase] transaction error:`, err);
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

/* ----------------------------- Route Handler --------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    const data = await request.json();

    if (!data.transaction_id) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required", ok: false },
        { status: 400 }
      );
    }

    // Verify the transaction with Flutterwave
    const verified_transaction = await verifyFlutterwaveTransaction(
      data.transaction_id
    );

    // Check if it's a subscription (no meta or meta.type === 'subscription')
    const meta = verified_transaction?.data?.meta;

    // Handle purchase transaction (with DB updates)
    const result = await processPurchaseTransaction(
      verified_transaction,
      "verification"
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[verification] error:", error);

    const errorResponse = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "transactions: verify flutterwaze transaction",
      error as any,
      errorResponse.status
    );

    return NextResponse.json(
      {
        ok: false,
        success: false,
        message: errorResponse?.message || "Payment verification failed",
      },
      { status: errorResponse?.status || 500 }
    );
  }
});
