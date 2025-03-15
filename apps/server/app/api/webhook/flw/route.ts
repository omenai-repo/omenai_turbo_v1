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
import { SubscriptionTransactionModelSchemaTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";

export async function POST(request: Request) {
  const req = await request.json();
  const secretHash = process.env.FLW_SECRET_HASH!;
  const signature = request.headers.get("verif-hash");

  if (!signature) {
    return NextResponse.json({ status: 401 });
  }

  const signatureBuffer = Buffer.from(signature, "utf8");
  const secretHashBuffer = Buffer.from(secretHash, "utf8");

  if (signatureBuffer.length !== secretHashBuffer.length) {
    return NextResponse.json({ status: 401 });
  }

  const isValidSignature = crypto.timingSafeEqual(
    new Uint8Array(signatureBuffer),
    new Uint8Array(secretHashBuffer)
  );

  if (!isValidSignature) {
    return NextResponse.json({ status: 401 });
  }

  if (req.event === "charge.completed") {
    const client = await connectMongoDB();

    const existingTransaction = await SubscriptionTransactions.findOne({
      reference: req.data.id,
    });

    if (existingTransaction) {
      return NextResponse.json({ status: 200 });
    }

    if (req.data.status === "failed") {
      sendSubscriptionPaymentFailedMail({
        name: req.data.customer.name,
        email: req.data.customer.email,
      }).catch((err) =>
        console.error("Failed to send subscription payment failed email:", err)
      );

      return NextResponse.json({ status: 200 });
    }

    if (req.data.status === "pending") {
      return NextResponse.json({ status: 401 });
    }

    const verify_transaction = await fetch(
      `https://api.flutterwave.com/v3/transactions/${req.data.id}/verify`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        },
      }
    );

    const convert_verify_transaction_json_response =
      await verify_transaction.json();

    if (
      convert_verify_transaction_json_response.data.status === "successful" &&
      convert_verify_transaction_json_response.data.tx_ref ===
        req.data.tx_ref &&
      convert_verify_transaction_json_response.data.amount ===
        req.data.amount &&
      convert_verify_transaction_json_response.data.currency ===
        req.data.currency
    ) {
      const session = await client.startSession();
      const currency = getCurrencySymbol("USD");

      try {
        const date = new Date();
        session.startTransaction();

        const parts =
          convert_verify_transaction_json_response.data.tx_ref.split("&");

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
                card: convert_verify_transaction_json_response.data.card,
              },
            }
          ).session(session);

          await Proration.findOneAndUpdate(
            { gallery_id },
            { $inc: { value: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).session(session);

          await session.commitTransaction();
          return NextResponse.json({ status: 200 });
        } else {
          const data: Omit<
            SubscriptionTransactionModelSchemaTypes,
            "trans_id"
          > = {
            amount: formatPrice(
              convert_verify_transaction_json_response.data.amount,
              currency
            ),
            date,
            gallery_id,
            reference: convert_verify_transaction_json_response.data.id,
          };

          const create_transaction = await SubscriptionTransactions.create(
            [data],
            { session }
          );

          const found_customer = await Subscriptions.findOne({
            "customer.gallery_id": gallery_id,
          }).session(session);

          const expiry_date = getSubscriptionExpiryDate(plan_interval);
          const plan =
            await SubscriptionPlan.findById(plan_id).session(session);

          const subscription_data = {
            card: convert_verify_transaction_json_response.data.card,
            start_date: date.toISOString(),
            expiry_date: expiry_date.toISOString(),
            status: "active",
            payment: {
              value: convert_verify_transaction_json_response.data.amount,
              currency: "USD",
              type: convert_verify_transaction_json_response.data.payment_type,
              flw_ref: convert_verify_transaction_json_response.data.flw_ref,
              status: convert_verify_transaction_json_response.data.status,
              trans_ref: create_transaction[0].trans_id,
            },
            customer: {
              ...convert_verify_transaction_json_response.data.customer,
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
            { $set: { subscription_status: { type: plan.name, active: true } } }
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

  return NextResponse.json({ status: 200 });
}
