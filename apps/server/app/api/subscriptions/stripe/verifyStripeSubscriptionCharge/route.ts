// apps/server/app/api/subscription/verify/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  Subscriptions,
  SubscriptionPlan,
} from "@omenai/shared-models/models/subscriptions";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import type Stripe from "stripe";
import mongoose from "mongoose";
import { CombinedConfig } from "@omenai/shared-types";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

/**
 * Config (rate limits + allowed roles)
 */
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const paymentIntentId: string | undefined = body?.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json(
        { message: "paymentIntentId required" },
        { status: 400 }
      );
    }

    // Retrieve PI from Stripe (expanded for payment method & charge details)
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method", "charges.data.balance_transaction"],
    });

    if (!pi) {
      return NextResponse.json(
        { message: "PaymentIntent not found" },
        { status: 404 }
      );
    }

    const charge = pi.charges?.data?.[0] ?? null;
    const paymentMethod = pi.payment_method as Stripe.PaymentMethod | undefined;
    const txnStatus = pi.status;
    const metadata = pi.metadata ?? {};
    const { name, email, gallery_id } = metadata;

    // Map status to your domain status strings
    const domainStatus =
      txnStatus === "succeeded"
        ? "successful"
        : txnStatus === "processing"
          ? "processing"
          : "failed";

    // Idempotency check: if a transaction already exists and is succeeded, return early.
    const existingTxn = await SubscriptionTransactions.findOne(
      { payment_ref: pi.id },
      "status"
    )
      .lean<{ status?: string }>()
      .exec();

    if (existingTxn && existingTxn.status === "successful") {
      return NextResponse.json(
        { message: "Already processed", pi },
        { status: 200 }
      );
    }

    // Prepare transaction data
    const valueAmountInUnits = Number(pi.amount) / 100;
    const nowUTC = toUTCDate(new Date());
    const txnData = {
      amount: formatPrice(valueAmountInUnits, "USD"),
      raw_amount: pi.amount,
      date: nowUTC,
      gallery_id,
      payment_ref: pi.id,
      status: domainStatus,
      stripe_customer_id: String(pi.customer ?? ""),
      stripe_charge_id: charge?.id ?? null,
      payment_method_id: paymentMethod?.id ?? null,
      card_brand: paymentMethod?.card?.brand ?? null,
      card_last4: paymentMethod?.card?.last4 ?? null,
      failure_code: charge?.failure_code ?? null,
      failure_message: charge?.failure_message ?? null,
      raw: pi,
    };

    // Start a mongoose transaction for atomicity of subscription + transaction writes
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // 1) Upsert transaction record and insert history in parallel
      (await SubscriptionTransactions.findOneAndUpdate(
        { payment_ref: pi.id },
        { $set: txnData },
        { upsert: true, new: true, session }
      ),
        await mongoose.connection
          .collection("subscription_transaction_histories")
          .insertOne({ ...txnData, recorded_at: nowUTC }, { session }));

      // 2) If succeeded -> create or update subscription
      if (txnStatus === "succeeded") {
        const plan_id = metadata.plan_id ?? metadata.planId;
        const plan_interval = metadata.plan_interval ?? metadata.planInterval;
        const customer = String(pi.customer ?? metadata.customer ?? "");

        if (!plan_id || !plan_interval) {
          await session.abortTransaction();
          return NextResponse.json(
            {
              message:
                "Missing plan metadata (plan_id or plan_interval) on PaymentIntent",
            },
            { status: 400 }
          );
        }

        // Fetch plan and existing subscription in parallel
        const [plan, existingSubscription] = await Promise.all([
          SubscriptionPlan.findOne({ plan_id }).session(session),
          Subscriptions.findOne({ stripe_customer_id: customer }).session(
            session
          ),
        ]);
        if (!plan) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "Plan not found" },
            { status: 400 }
          );
        }

        const expiryDate = getSubscriptionExpiryDate(plan_interval);
        const subPayload = {
          start_date: nowUTC,
          expiry_date: expiryDate,
          paymentMethod: paymentMethod ?? undefined,
          stripe_customer_id: customer,
          customer: { name, email, gallery_id },
          status: "active",
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
            id: plan.plan_id,
          },
          upload_tracker: {
            limit: getUploadLimitLookup(plan.name, plan_interval),
            next_reset_date: expiryDate.toISOString(),
            upload_count: existingSubscription
              ? (existingSubscription.upload_tracker?.upload_count ?? 0)
              : 0,
          },
        };

        if (!existingSubscription) {
          await Subscriptions.create([subPayload], { session });
        } else {
          const isActiveAndNotExpired =
            existingSubscription.status === "active" &&
            new Date(existingSubscription.expiry_date) > nowUTC;

          if (isActiveAndNotExpired) {
            const upload_tracker = {
              limit: getUploadLimitLookup(plan.name, plan_interval),
              next_reset_date: expiryDate.toISOString(),
              upload_count:
                existingSubscription.upload_tracker?.upload_count ?? 0,
            };
            await Subscriptions.updateOne(
              { stripe_customer_id: customer },
              { $set: { ...subPayload, upload_tracker } },
              { session }
            );
          } else {
            await Subscriptions.updateOne(
              { stripe_customer_id: customer },
              { $set: subPayload },
              { session }
            );
          }
        }
        await AccountGallery.updateOne(
          { gallery_id },
          { $set: { subscription_status: { type: plan.name, active: true } } }
        );
      }

      await session.commitTransaction();
    } catch (txErr) {
      await session.abortTransaction();
      console.error("Transaction failed:", txErr);
      throw txErr;
    } finally {
      session.endSession();
    }

    // Final response based on Stripe PI status
    if (txnStatus === "succeeded") {
      return NextResponse.json(
        { message: "Payment succeeded and processed", pi },
        { status: 200 }
      );
    } else if (txnStatus === "processing") {
      return NextResponse.json(
        { message: "Payment is processing", pi },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Payment failed", pi },
        { status: 400 }
      );
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Verify endpoint error:", error);
    return NextResponse.json(
      { message: error_response?.message ?? "Internal error" },
      { status: error_response?.status ?? 500 }
    );
  }
});

/**
 * Helper: upload limits lookup (kept same as your original mapping)
 */
type PlanName = "Basic" | "Pro" | "Premium";
type PlanInterval = "monthly" | "yearly";
const uploadLimits: Record<PlanName, Record<PlanInterval, number>> = {
  Basic: { monthly: 5, yearly: 75 },
  Pro: { monthly: 15, yearly: 225 },
  Premium: {
    monthly: Number.MAX_SAFE_INTEGER,
    yearly: Number.MAX_SAFE_INTEGER,
  },
};
function getUploadLimitLookup(
  planName: PlanName,
  planInterval: PlanInterval
): number {
  return uploadLimits[planName][planInterval];
}
