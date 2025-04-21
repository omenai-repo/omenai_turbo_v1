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
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
  SubscriptionTransactionModelSchemaTypes,
} from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { sendPaymentSuccessMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { sendPaymentSuccessGalleryMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessGalleryMail";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";

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

async function handleSubscriptionPayment(
  verified_transaction: any,
  req: any,
  session: any
) {
  const existingTransaction = await SubscriptionTransactions.findOne({
    reference: req.data.id,
  });

  if (existingTransaction) {
    return NextResponse.json({ status: 200 });
  }
  if (verified_transaction.data.status === "failed") {
    sendSubscriptionPaymentFailedMail({
      name: req.data.customer.name,
      email: req.data.customer.email,
    }).catch((err) =>
      console.error("Failed to send subscription payment failed email:", err)
    );

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
    const currency = getCurrencySymbol("USD");
    try {
      const date = new Date();
      session.startTransaction();

      const parts = verified_transaction.data.tx_ref.split("&");

      if (parts.length !== 5) {
        console.error("Unexpected tx_ref format");
        return NextResponse.json({ status: 401 });
      }

      const [ref, gallery_id, plan_id, plan_interval, charge_type] = parts;

      if (charge_type === "card_change") {
        await Subscriptions.updateOne(
          { "customer.gallery_id": gallery_id },
          {
            $set: {
              card: verified_transaction.data.card,
            },
          }
        ).session(session);

        await Proration.findOneAndUpdate(
          { gallery_id },
          { $inc: { value: 1 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).session(session);
        //TODO: Send a mail after card change
        await session.commitTransaction();
        return NextResponse.json({ status: 200 });
      } else {
        const data: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> =
          {
            amount: formatPrice(verified_transaction.data.amount, currency),
            date,
            gallery_id,
            reference: verified_transaction.data.id,
          };
        const create_transaction = await SubscriptionTransactions.create(
          [data],
          { session }
        );
        const found_customer = await Subscriptions.findOne({
          "customer.gallery_id": gallery_id,
        }).session(session);
        const expiry_date = getSubscriptionExpiryDate(plan_interval);
        const plan = await SubscriptionPlan.findOne({ plan_id }).session(
          session
        );
        const subscription_data = {
          card: verified_transaction.data.card,
          start_date: date.toISOString(),
          expiry_date: expiry_date.toISOString(),
          status: "active",
          payment: {
            value: verified_transaction.data.amount,
            currency: "USD",
            type: verified_transaction.data.payment_type,
            flw_ref: verified_transaction.data.flw_ref,
            status: verified_transaction.data.status,
            trans_ref: create_transaction[0].trans_id,
          },
          customer: {
            ...verified_transaction.data.customer,
            gallery_id,
          },
          plan_details: {
            type: plan.name,
            value: plan.pricing,
            currency: plan.currency,
            interval: plan_interval,
          },
          next_charge_params: {
            value:
              plan_interval === "monthly"
                ? +plan.pricing.monthly_price
                : +plan.pricing.annual_price,
            currency: "USD",
            type: plan.name,
            interval: plan_interval,
            id: plan._id,
          },
        };
        if (!found_customer) {
          await Subscriptions.create([subscription_data], { session });
        } else {
          await Subscriptions.updateOne(
            { "customer.gallery_id": gallery_id },
            { $set: subscription_data }
          ).session(session);
        }

        await AccountGallery.updateOne(
          { gallery_id },
          {
            $set: {
              subscription_status: { type: plan.name, active: true },
            },
          }
        ).session(session);
        await session.commitTransaction();
      }
    } catch (error) {
      console.error("An error occurred during the transaction:", error);
      await session.abortTransaction();
      return NextResponse.json({ status: 401 });
    } finally {
      await session.endSession();
    }

    sendSubscriptionPaymentSuccessfulMail({
      name: req.data.customer.name,
      email: req.data.customer.email,
    }).catch((err) =>
      console.error("Failed to send subscription payment success email:", err)
    );

    return NextResponse.json({ status: 200 });
  } else {
    return NextResponse.json({ status: 200 });
  }
}

async function handlePurchaseTransaction(
  verified_transaction: any,
  req: any,
  session: any
) {
  if (verified_transaction.data.status === "failed") {
    //TODO: Send email to user about failed payment

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
    const meta = verified_transaction.data.meta;

    try {
      const date = new Date();
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
          Number(meta.tax_fees)
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

      const releaseOrderLockPromise = releaseOrderLock(
        meta.art_id,
        meta.buyer_id
      );

      const updateManyOrdersPromise = CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer_details.id": { $ne: meta.buyer_id },
        },
        { $set: { availability: false } }
      ).session(session);

      // Update the wallet balance
      const find_wallet = await Wallet.findOne({
        owner_id: meta.seller_id,
      });

      const wallet_increment_amount = Math.round(
        verified_transaction.data.amount -
          (commission + Number(meta.tax_fees) + Number(meta.shipping_cost))
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
        releaseOrderLockPromise,
        updateManyOrdersPromise,
        find_wallet,
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
    const email_order_info = await CreateOrder.findOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
      },
      "artwork_data order_id createdAt buyer_details"
    );

    const price = formatPrice(verified_transaction.data.amount, currency);

    // Send emails asynchronously
    sendPaymentSuccessMail({
      email: meta.buyer_email,
      name: email_order_info.buyer_details.name,
      artwork: email_order_info.artwork_data.title,
      order_id: email_order_info.order_id,
      order_date: formatIntlDateTime(email_order_info.createdAt),
      transaction_Id: transaction_id,
      price,
    }).catch((err) =>
      console.error("Failed to send payment success email:", err)
    );

    sendPaymentSuccessGalleryMail({
      email: meta.seller_email,
      name: meta.seller_name,
      artwork: meta.artwork_name,
      order_id: email_order_info.order_id,
      order_date: formatIntlDateTime(email_order_info.createdAt),
      transaction_Id: transaction_id,
      price,
    }).catch((err) =>
      console.error("Failed to send payment success gallery email:", err)
    );

    return NextResponse.json({ status: 200 });
  } else {
    return NextResponse.json({ status: 200 });
  }
}

export async function POST(request: Request) {
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

    if (transactionType === "subscription") {
      await handleSubscriptionPayment(verified_transaction, req, session);
    } else {
      await handlePurchaseTransaction(verified_transaction, req, session);
    }
  }

  return NextResponse.json({ status: 200 });
}
