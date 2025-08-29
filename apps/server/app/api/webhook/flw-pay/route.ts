import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Proration } from "@omenai/shared-models/models/prorations/ProrationSchemaModel";
import {
  SubscriptionPlan,
  Subscriptions,
} from "@omenai/shared-models/models/subscriptions/index";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import {
  NotificationPayload,
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
  SubscriptionTransactionModelSchemaTypes,
} from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { sendSubscriptionPaymentPendingMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentPendingMail";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";

type PlanName = "Basic" | "Pro" | "Premium";
type PlanInterval = "monthly" | "yearly";
async function verifyWebhookSignature(
  signature: string | null,
  secretHash: string
): Promise<boolean> {
  if (!signature) return false;

  const signatureBuffer = Buffer.from(signature, "utf8");
  const secretHashBuffer = Buffer.from(secretHash, "utf8");

  if (signatureBuffer.length !== secretHashBuffer.length) return false;

  return crypto.timingSafeEqual(
    new Uint8Array(signatureBuffer),
    new Uint8Array(secretHashBuffer)
  );
}

async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<any> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) throw new Error("Transaction verification failed");
  return await response.json();
}

async function handlePurchaseTransaction(
  verified_transaction: any,
  req: any,
  session: any
) {
  const meta = verified_transaction.data.meta;

  const order_info = await CreateOrder.findOne({
    "buyer_details.email": meta.buyer_email,
    "artwork_data.art_id": meta.art_id,
  });
  if (verified_transaction.data.status === "failed") {
    //DONE: Send email to user about failed payment
    await sendPaymentFailedMail({
      email: meta.buyer_email,
      name: order_info.buyer_details.name,
      artwork: order_info.artwork_data.title,
    });

    return NextResponse.json({ status: 200 });
  }

  if (verified_transaction.data.status === "pending") {
    return NextResponse.json({ status: 401 });
  }

  if (
    verified_transaction.data.status === "successful" &&
    verified_transaction.data.tx_ref === req.data.tx_ref &&
    verified_transaction.data.amount === req.data.amount &&
    verified_transaction.data.currency === req.data.currency
  ) {
    let transaction_id;

    const formatted_date = getFormattedDateTime();
    const currency = getCurrencySymbol("USD");

    await CreateOrder.updateOne(
      { order_id: order_info.order_id },
      { $set: { hold_status: null } }
    );
    try {
      const date = toUTCDate(new Date());
      session.startTransaction();

      const existingTransaction = await PurchaseTransactions.findOne({
        trans_reference: req.data.id,
      }).session(session);

      if (existingTransaction) {
        session.abortTransaction();
        return NextResponse.json({ status: 200 });
      }

      // Update payment information in order
      const payment_information: PaymentStatusTypes = {
        status: "completed",
        transaction_value: formatPrice(
          verified_transaction.data.amount,
          currency
        ),
        transaction_date: formatted_date,
        transaction_reference: verified_transaction.data.id,
      };

      const updateOrderPromise = CreateOrder.updateOne(
        {
          "buyer_details.email": meta.buyer_email,
          "artwork_data.art_id": meta.art_id,
        },
        {
          $set: {
            payment_information,
          },
        }
      ).session(session);

      const commission = Math.round(
        0.5 * Number(meta.unit_price) +
          Number(meta.shipping_cost) +
          Number(meta.tax_fees || 0)
      );

      const transaction_pricing: PurchaseTransactionPricing = {
        amount_total: Math.round(verified_transaction.data.amount),
        unit_price: Math.round(+meta.unit_price),
        shipping_cost: Math.round(+meta.shipping_cost),
        commission,
        tax_fees: Math.round(+meta.tax_fees),
      };

      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_pricing: transaction_pricing,
        trans_date: date,
        trans_recipient_id: meta.seller_id,
        trans_initiator_id: meta.buyer_id,
        trans_recipient_role: "artist",
        trans_reference: verified_transaction.data.id,
      };

      const createTransactionPromise = PurchaseTransactions.create([data], {
        session,
      });

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

      // Update the wallet balance

      const wallet_increment_amount = Math.round(
        verified_transaction.data.amount -
          (commission + Number(meta.tax_fees || 0) + Number(meta.shipping_cost))
      );

      const fund_wallet = await Wallet.updateOne(
        { owner_id: meta.seller_id },
        {
          $inc: {
            pending_balance: wallet_increment_amount,
          },
        }
      );
      const [createTransactionResult] = await Promise.all([
        createTransactionPromise,
        updateOrderPromise,
        updateArtworkPromise,
        createSalesActivityPromise,
        updateManyOrdersPromise,
        fund_wallet,
      ]);

      transaction_id = createTransactionResult[0].trans_id;

      await session.commitTransaction();
      console.log("Transaction committed.");
    } catch (error) {
      console.error("An error occurred during the transaction:", error);
      await session.abortTransaction();
      return NextResponse.json({ status: 400 });
    } finally {
      await session.endSession();
    }

    const buyer_push_token = await DeviceManagement.findOne(
      { auth_id: order_info.buyer_details.id },
      "device_push_token"
    );
    const seller_push_token = await DeviceManagement.findOne(
      { auth_id: order_info.seller_details.id },
      "device_push_token"
    );
    const notificationPromises = [];

    // Check for actual token value, not just document existence
    if (buyer_push_token?.device_push_token) {
      const buyer_notif_payload: NotificationPayload = {
        to: buyer_push_token.device_push_token, // Extract the actual token
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
        ).catch((error) => {
          console.error("Failed to send buyer notification:", error);
        })
      );
    }

    if (seller_push_token?.device_push_token) {
      const seller_notif_payload: NotificationPayload = {
        to: seller_push_token.device_push_token, // Extract the actual token
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
        ).catch((error) => {
          console.error("Failed to send seller notification:", error);
        })
      );
    }
    const price = formatPrice(verified_transaction.data.amount, currency);

    await Promise.all([
      createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${generateDigit(6)}`,
        JSON.stringify({ order_id: order_info.order_id })
      ),
      createWorkflow(
        "/api/workflows/emails/sendPaymentSuccessMail",
        `send_payment_success_mail${generateDigit(6)}`,
        JSON.stringify({
          buyer_email: order_info.buyer_details.email,
          buyer_name: order_info.buyer_details.name,
          artwork_title: order_info.artwork_data.title,
          order_id: order_info.order_id,
          order_date: order_info.createdAt,
          transaction_id: transaction_id,
          price,
          seller_email: order_info.seller_details.email,
          seller_name: order_info.seller_details.name,
        })
      ),
      ...notificationPromises,
    ]);

    return NextResponse.json({ status: 200 });
  } else {
    return NextResponse.json({ status: 200 });
  }
}

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  const secretHash = process.env.FLW_SECRET_HASH!;
  const signature = request.headers.get("verif-hash");
  const isValid = await verifyWebhookSignature(signature, secretHash);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 }
    );
  }

  const req = await request.json();

  if (req.event === "charge.completed") {
    // Verify transaction with flw api
    const verified_transaction = await verifyFlutterwaveTransaction(
      req.data.id
    );

    const transactionType =
      verified_transaction.data.meta !== null ? "purchase" : "subscription";
    // Spin up DB Server
    const client = await connectMongoDB();
    const session = await client.startSession();

    // if (transactionType === "subscription") {
    //   // await handleSubscriptionPayment(verified_transaction, req, session);
    // } else {
    await handlePurchaseTransaction(verified_transaction, req, session);
    // }
  }

  return NextResponse.json({ status: 200 });
});
