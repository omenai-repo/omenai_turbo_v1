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
    // This request isn't from Flutterwave, discard
    return NextResponse.json({ status: 401 });
  }

  // Convert the signature and secret hash to Buffers
  const signatureBuffer = Buffer.from(signature, "utf8");
  const secretHashBuffer = Buffer.from(secretHash, "utf8");

  // Check if they have the same length
  if (signatureBuffer.length !== secretHashBuffer.length) {
    return NextResponse.json({ status: 401 });
  }

  // Use crypto.timingSafeEqual to compare
  const isValidSignature = crypto.timingSafeEqual(
    new Uint8Array(signatureBuffer),
    new Uint8Array(secretHashBuffer)
  );

  if (!isValidSignature) {
    // Signature doesn't match, discard the request
    return NextResponse.json({ status: 401 });
  }
  // Send failure mail if status is failure

  if (req.event === "charge.completed") {
    const client = await connectMongoDB();

    // Check if this transaction has already been processed

    const existingTransaction = await SubscriptionTransactions.findOne({
      reference: req.data.id,
    });

    if (existingTransaction) {
      // Transaction already processed
      return NextResponse.json({ status: 200 });
    }

    if (req.data.status === "failed") {
      await sendSubscriptionPaymentFailedMail({
        name: req.data.customer.name,
        email: req.data.customer.email,
      });

      return NextResponse.json({ status: 200 });
    }
    if (req.data.status === "pending") {
      // await sendSubscriptionPaymentFailedMail({
      //   name: req.data.customer.name,
      //   email: req.data.customer.email,
      // });

      return NextResponse.json({ status: 401 });
    }
    // Verify transaction again

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
      // Create a session with the initialized MongoClient
      const session = await client.startSession();

      const currency = getCurrencySymbol("USD");

      try {
        // Retrieve the MongoDB Client
        const date = new Date();

        // Success! Confirm the customer's payment

        // Update transaction collection
        session.startTransaction();

        const parts =
          convert_verify_transaction_json_response.data.tx_ref.split("&");

        if (parts.length !== 5) {
          // Handle error: Unexpected format
          console.error("Unexpected tx_ref format");
          return NextResponse.json({ status: 401 });
        }

        const [ref, gallery_id, plan_id, plan_interval, charge_type] = parts;

        if (
          charge_type !== "null" &&
          charge_type !== null &&
          charge_type !== undefined &&
          charge_type === "card_change"
        ) {
          await Subscriptions.updateOne(
            {
              "customer.gallery_id": gallery_id,
            },
            {
              $set: {
                card: convert_verify_transaction_json_response.data.card,
              },
            }
          );
          // Add to proration
          await Proration.findOneAndUpdate(
            { gallery_id }, // Filter to find the document
            { $inc: { value: 1 } }, // Increment the value by 1
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

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
            type: "subscription",
          };

          const create_transaction =
            await SubscriptionTransactions.create(data);

          // Check DB to see if a subscription with this customer reference is present
          const found_customer = await Subscriptions.findOne({
            "customer.gallery_id": gallery_id,
          });
          // Create new customer subscription

          const expiry_date = getSubscriptionExpiryDate(plan_interval);
          const plan = await SubscriptionPlan.findById(plan_id);

          if (!found_customer) {
            const subscription_data = {
              card: convert_verify_transaction_json_response.data.card,
              start_date: date.toISOString(),
              expiry_date: expiry_date.toISOString(),
              status: "active",
              payment: {
                value: convert_verify_transaction_json_response.data.amount,
                currency: "USD",
                type: convert_verify_transaction_json_response.data
                  .payment_type,
                flw_ref: convert_verify_transaction_json_response.data.flw_ref,
                status: convert_verify_transaction_json_response.data.status,
                trans_ref: create_transaction.trans_id,
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

            await Subscriptions.create({
              ...subscription_data,
            });

            await AccountGallery.updateOne(
              {
                gallery_id,
              },
              { $set: { subscription_active: true } }
            );
          } else
            await Subscriptions.updateOne(
              {
                "customer.gallery_id": gallery_id,
              },
              {
                $set: {
                  card: convert_verify_transaction_json_response.data.card,
                  start_date: date.toISOString(),
                  expiry_date: expiry_date.toISOString(),
                  status: "active",
                  payment: {
                    value: convert_verify_transaction_json_response.data.amount,
                    currency: "USD",
                    type: convert_verify_transaction_json_response.data
                      .payment_type,
                    flw_ref:
                      convert_verify_transaction_json_response.data.flw_ref,
                    status:
                      convert_verify_transaction_json_response.data.status,
                    trans_ref: create_transaction.trans_id,
                  },
                  customer: {
                    ...convert_verify_transaction_json_response.data.customer,
                    gallery_id: gallery_id,
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
                },
              }
            );

          await AccountGallery.updateOne(
            {
              gallery_id,
            },
            { $set: { subscription_active: true } }
          );
        }
      } catch (error) {
        console.log("An error occurred during the transaction:" + error);

        // If any errors are encountered, abort the transaction process, this rolls back all updates and ensures that the DB isn't written to.
        await session.abortTransaction();
        // Exit the webhook
        return NextResponse.json({ status: 401 });
      } finally {
        // End the session to avoid reusing the same Mongoclient for different transactions
        await session.endSession();
      }

      await sendSubscriptionPaymentSuccessfulMail({
        name: req.data.customer.name,
        email: req.data.customer.email,
      });
      return NextResponse.json({ status: 200 });
    } else {
      return NextResponse.json({ status: 200 });
    }
  }
}
