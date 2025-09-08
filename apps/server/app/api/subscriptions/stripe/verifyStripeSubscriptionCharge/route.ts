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
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import type Stripe from "stripe";
import mongoose, { ClientSession } from "mongoose";
import {
  CombinedConfig,
  SubscriptionTransactionModelSchemaTypes,
} from "@omenai/shared-types";
import { z } from "zod";
import { sendSubscriptionPaymentFailedMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentFailedMail";
import { sendSubscriptionPaymentPendingMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentPendingMail";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";

/* -------------------------------------------------------------------------- */
/*                                CONFIG SETUP                                */
/* -------------------------------------------------------------------------- */
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};

/* -------------------------------------------------------------------------- */
/*                                   SCHEMAS                                  */
/* -------------------------------------------------------------------------- */
const RequestSchema = z.object({
  paymentIntentId: z.string().min(1, "paymentIntentId required"),
});

const MetadataSchema = z.object({
  name: z.string().optional().default(""),
  email: z.string().email().optional().default(""),
  gallery_id: z.string().min(1, "gallery_id missing in metadata"),
  // Accept both snakeCase and camelCase for backward-compat
  plan_id: z.string().optional(),
  planId: z.string().optional(),
  plan_interval: z.enum(["monthly", "yearly"]).optional(),
  planInterval: z.enum(["monthly", "yearly"]).optional(),
  customer: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*                                  HANDLER                                   */
/* -------------------------------------------------------------------------- */
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const parsedBody = RequestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return badRequest(parsedBody.error.flatten().fieldErrors);
    }
    const { paymentIntentId } = parsedBody.data;

    // Retrieve PI from Stripe (expanded for payment method & charge details)
    let pi: Stripe.PaymentIntent;
    try {
      pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["payment_method", "charges.data.balance_transaction"],
      });
    } catch (err) {
      // Stripe throws for not-found; normalize to 404
      return NextResponse.json(
        { message: "PaymentIntent not found" },
        { status: 404 }
      );
    }

    const metadataParse = MetadataSchema.safeParse(pi.metadata ?? {});
    if (!metadataParse.success) {
      return badRequest(metadataParse.error.flatten().fieldErrors);
    }
    const rawMeta = metadataParse.data;

    const paymentMethod = pi.payment_method as Stripe.PaymentMethod | null;
    const txnStatus = pi.status;
    const domainStatus = mapStripeStatusToDomain(txnStatus);

    // Resolve dual-key metadata
    const plan_id = rawMeta.plan_id ?? rawMeta.planId;
    const plan_interval = (rawMeta.plan_interval ?? rawMeta.planInterval) as
      | PlanInterval
      | undefined;
    const customer = String(pi.customer ?? rawMeta.customer ?? "");
    const { name, email, gallery_id } = rawMeta;

    // Minimal required metadata for subsequent writes; keep logic identical
    if (!gallery_id) {
      return NextResponse.json(
        { message: "Missing gallery_id in PaymentIntent metadata" },
        { status: 400 }
      );
    }

    // Idempotency check: if a transaction already exists and is succeeded, return early.
    const existingTxn = await SubscriptionTransactions.findOne(
      { payment_ref: pi.id },
      "status"
    )
      .lean<{ status?: string }>()
      .exec();

    if (existingTxn?.status === "successful") {
      return NextResponse.json(
        { message: "Transaction processed successfully", pi },
        { status: 200 }
      );
    }

    // Prepare transaction data
    const amountInUnits = Number(pi.amount) / 100;
    const nowUTC = toUTCDate(new Date());

    const txnData: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> = {
      amount: amountInUnits,
      payment_ref: pi.id,
      date: nowUTC,
      gallery_id,
      status: domainStatus,
      stripe_customer_id: customer,
    };

    // Mongoose transaction for atomic writes
    const session = await mongoose.startSession();
    let shouldSendSuccessEmail = false;

    try {
      session.startTransaction();

      // Upsert transaction (idempotent)
      await SubscriptionTransactions.findOneAndUpdate(
        { payment_ref: pi.id },
        { $set: txnData },
        { upsert: true, new: true, session }
      );

      // If succeeded -> create or update subscription (same business logic)
      if (txnStatus === "succeeded") {
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
        const subPayload = buildSubscriptionPayload({
          nowUTC,
          expiryDate,
          paymentMethod: paymentMethod ?? undefined,
          customer,
          name,
          email,
          gallery_id,
          plan,
          plan_interval,
          existingSubscription,
        });

        if (!existingSubscription) {
          await Subscriptions.create([subPayload], { session });
        } else {
          await updateExistingSubscription(
            existingSubscription,
            customer,
            subPayload,
            expiryDate,
            plan.name as PlanName,
            plan_interval,
            session
          );
        }

        await AccountGallery.updateOne(
          { gallery_id },
          { $set: { subscription_status: { type: plan.name, active: true } } },
          { session }
        );

        shouldSendSuccessEmail = true;
      }

      await session.commitTransaction();
    } catch (txErr) {
      await session.abortTransaction();
      console.error("[subscription.verify] Transaction failed:", txErr);
      throw txErr;
    } finally {
      session.endSession();
    }

    // Side-effects after commit (don’t jeopardize user outcome if email fails)
    void safeSendEmail(() => {
      if (txnStatus === "succeeded" && shouldSendSuccessEmail) {
        return sendSubscriptionPaymentSuccessfulMail({ name, email });
      }
      if (txnStatus === "processing") {
        return sendSubscriptionPaymentPendingMail({ name, email });
      }
      return sendSubscriptionPaymentFailedMail({ name, email });
    });

    // Final response mirrors original logic
    if (txnStatus === "succeeded") {
      return NextResponse.json(
        { message: "Payment succeeded and processed", pi },
        { status: 200 }
      );
    }
    if (txnStatus === "processing") {
      return NextResponse.json(
        { message: "Payment is processing", pi },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: "Payment failed", pi },
      { status: 400 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    // Do not leak internals in production; normalize output
    console.error("[subscription.verify] Uncaught error:", error);
    return NextResponse.json(
      { message: error_response?.message ?? "Internal error" },
      { status: error_response?.status ?? 500 }
    );
  }
});

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */
function badRequest(errors: unknown) {
  return NextResponse.json({ message: "Bad Request", errors }, { status: 400 });
}

function mapStripeStatusToDomain(
  status: Stripe.PaymentIntent.Status
): "successful" | "processing" | "failed" {
  switch (status) {
    case "succeeded":
      return "successful";
    case "processing":
      return "processing";
    default:
      return "failed";
  }
}

async function safeSendEmail(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    // In production we log and move on; don’t break the API response
    console.error("[subscription.verify] Email dispatch failed:", err);
  }
}

type UploadTracker = {
  limit: number;
  next_reset_date: string;
  upload_count: number;
};

type BuildSubPayloadArgs = {
  nowUTC: Date;
  expiryDate: Date;
  paymentMethod?: Stripe.PaymentMethod;
  customer: string;
  name: string;
  email: string;
  gallery_id: string;
  plan: {
    name: PlanName;
    pricing: { monthly_price: string | number; annual_price: string | number };
    currency: string;
    plan_id: string;
  };
  plan_interval: PlanInterval;
  existingSubscription: {
    status?: "active" | "inactive" | string;
    expiry_date?: string | Date;
    upload_tracker?: { upload_count?: number } | null;
  } | null;
};

function buildSubscriptionPayload({
  nowUTC,
  expiryDate,
  paymentMethod,
  customer,
  name,
  email,
  gallery_id,
  plan,
  plan_interval,
  existingSubscription,
}: BuildSubPayloadArgs) {
  const uploadTracker: UploadTracker = {
    limit: getUploadLimitLookup(plan.name, plan_interval),
    next_reset_date: expiryDate.toISOString(),
    upload_count: existingSubscription?.upload_tracker?.upload_count ?? 0,
  };

  return {
    start_date: nowUTC,
    expiry_date: expiryDate,
    paymentMethod,
    stripe_customer_id: customer,
    customer: { name, email, gallery_id },
    status: "active" as const,
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
    upload_tracker: uploadTracker,
  };
}

async function updateExistingSubscription(
  existingSubscription: {
    status?: string;
    expiry_date?: string | Date;
    upload_tracker?: { upload_count?: number } | null;
  },
  customer: string,
  subPayload: ReturnType<typeof buildSubscriptionPayload>,
  expiryDate: Date,
  planName: PlanName,
  planInterval: PlanInterval,
  session: ClientSession
) {
  const now = new Date();
  const isActiveAndNotExpired =
    existingSubscription.status === "active" &&
    new Date(existingSubscription.expiry_date ?? 0) > now;

  if (isActiveAndNotExpired) {
    const upload_tracker: UploadTracker = {
      limit: getUploadLimitLookup(planName, planInterval),
      next_reset_date: expiryDate.toISOString(),
      upload_count: existingSubscription.upload_tracker?.upload_count ?? 0,
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

/* -------------------------------------------------------------------------- */
/*                             UPLOAD LIMIT LOOKUP                            */
/* -------------------------------------------------------------------------- */
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
