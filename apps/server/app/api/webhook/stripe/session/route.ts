import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NextResponse } from "next/server";
import { createErrorRollbarReport } from "../../../util";
import { redis } from "@omenai/upstash-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";

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

  if (
    sessionObj.status !== "complete" ||
    sessionObj.payment_status !== "paid"
  ) {
    return NextResponse.json({ status: 400 });
  }

  const meta = sessionObj.metadata;
  if (!meta?.buyer_email || !meta?.art_id) {
    return NextResponse.json({ status: 400 });
  }

  const existing = await PurchaseTransactions.findOne({
    trans_reference: sessionObj.id,
  });

  if (existing) {
    return NextResponse.json({ status: 200 });
  }

  const order = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
    "order_accepted.status": "accepted",
  });

  if (!order) return NextResponse.json({ status: 404 });

  return processStripePayment(sessionObj, meta, order);
}

/* -------------------------------------------------------------------------- */
/*                         STRIPE PAYMENT PROCESSOR                            */
/* -------------------------------------------------------------------------- */

async function processStripePayment(
  checkoutSession: any,
  meta: any,
  order_info: any
) {
  const client = await connectMongoDB();
  const session = await client.startSession();

  const date = toUTCDate(new Date());
  let transaction_id: string | undefined;

  try {
    session.startTransaction();

    const payment_information: PaymentStatusTypes = {
      status: "completed",
      transaction_value: checkoutSession.amount_total / 100,
      transaction_date: date,
      transaction_reference: checkoutSession.id,
    };

    const pricing: PurchaseTransactionPricing = {
      amount_total: Math.round(checkoutSession.amount_total / 100),
      unit_price: Math.round(+meta.unit_price),
      shipping_cost: Math.round(+meta.shipping_cost),
      commission: Math.round(+meta.commission),
      tax_fees: Math.round(+meta.tax_fees),
      currency: "USD",
    };

    const transactionData: Omit<
      PurchaseTransactionModelSchemaTypes,
      "trans_id"
    > = {
      trans_pricing: pricing,
      trans_date: date,
      trans_recipient_id: meta.seller_id,
      trans_initiator_id: meta.buyer_id,
      trans_recipient_role: "gallery",
      trans_reference: checkoutSession.id,
      status: "successful",
    };

    const [updateOrder, [tx]] = await Promise.all([
      CreateOrder.updateOne(
        { order_id: order_info.order_id },
        { $set: { payment_information, hold_status: null } },
        { session }
      ),
      PurchaseTransactions.create([transactionData], {
        session,
      }),
    ]);

    if (
      (updateOrder.matchedCount > 0 && updateOrder.modifiedCount === 0) ||
      !tx
    ) {
      throw new Error("Failed to update order with payment information");
    }

    transaction_id = tx.trans_id;

    try {
      const artwork = await Artworkuploads.findOneAndUpdate(
        { art_id: meta.art_id },
        { $set: { availability: false } },
        { new: true }
      );
      await redis.set(`artwork:${meta.art_id}`, JSON.stringify(artwork));
    } catch (e: any) {
      rollbarServerInstance.error(e);
    }

    const { month, year } = getCurrentMonthAndYear();

    await Promise.all([
      SalesActivity.create(
        [
          {
            month,
            year,
            value: meta.unit_price,
            id: meta.seller_id,
            trans_ref: transactionData.trans_reference,
          },
        ],
        { session }
      ),
      CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer_details.id": { $ne: meta.buyer_id },
        },
        { $set: { availability: false } },
        { session }
      ),
    ]);

    await session.commitTransaction();

    await releaseOrderLock(meta.art_id, meta.buyer_id);

    await runPostPaymentWorkflows(checkoutSession, order_info, transaction_id);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    createErrorRollbarReport("Stripe checkout processing error", error, 500);

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return NextResponse.json({ status: 500 });
  } finally {
    await session.endSession();
  }
}

/* -------------------------------------------------------------------------- */
/*                        POST-PAYMENT WORKFLOWS                               */
/* -------------------------------------------------------------------------- */

async function runPostPaymentWorkflows(
  checkoutSession: any,
  order_info: any,
  transaction_id?: string
) {
  const currency = getCurrencySymbol(checkoutSession.currency.toUpperCase());
  const price = formatPrice(checkoutSession.amount_total / 100, currency);

  const [buyer_push, seller_push] = await Promise.all([
    DeviceManagement.findOne(
      { auth_id: order_info.buyer_details.id },
      "device_push_token"
    ),
    DeviceManagement.findOne(
      { auth_id: order_info.seller_details.id },
      "device_push_token"
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
        `notif_buyer_${order_info.order_id}_${generateDigit(2)}`,
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
        `notif_seller_${order_info.order_id}_${generateDigit(2)}`,
        JSON.stringify(payload)
      )
    );
  }

  await Promise.all([
    createWorkflow(
      "/api/workflows/shipment/create_shipment",
      `create_shipment_${generateDigit(6)}`,
      JSON.stringify({ order_id: order_info.order_id })
    ),
    createWorkflow(
      "/api/workflows/emails/sendPaymentSuccessMail",
      `send_payment_success_mail_${generateDigit(6)}`,
      JSON.stringify({
        buyer_email: order_info.buyer_details.email,
        buyer_name: order_info.buyer_details.name,
        artwork_title: order_info.artwork_data.title,
        order_id: order_info.order_id,
        order_date: order_info.createdAt,
        transaction_id,
        price,
        seller_email: order_info.seller_details.email,
        seller_name: order_info.seller_details.name,
      })
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
        500
      );
    }
  }

  return NextResponse.json({ status: 200 });
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTE                                    */
/* -------------------------------------------------------------------------- */

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
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
