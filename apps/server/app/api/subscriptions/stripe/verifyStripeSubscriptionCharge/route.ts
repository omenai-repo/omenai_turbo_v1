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
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { ForbiddenError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { createErrorRollbarReport } from "../../../util";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
type PlanName = "Basic" | "Pro" | "Premium";
type PlanInterval = "monthly" | "yearly";
type UploadTracker = {
  limit: number;
  next_reset_date: string;
  upload_count: number;
};

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
  plan_id: z.string().optional(),
  planId: z.string().optional(),
  plan_interval: z.enum(["monthly", "yearly"]).optional(),
  planInterval: z.enum(["monthly", "yearly"]).optional(),
  customer: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*                             UPLOAD LIMIT LOOKUP                            */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */
function badRequest(errors: unknown) {
  return NextResponse.json({ message: "Bad Request", errors }, { status: 400 });
}

function mapStripeStatusToDomain(
  status: Stripe.PaymentIntent.Status
): "successful" | "processing" | "failed" {
  if (status === "succeeded") return "successful";
  if (status === "processing") return "processing";
  return "failed";
}

async function safeSendEmail(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    console.error("[subscription.verify] Email dispatch failed:", err);
  }
}

async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method", "charges.data.balance_transaction"],
    });
  } catch (err) {
    return null;
  }
}

function resolveMetadata(
  rawMeta: z.infer<typeof MetadataSchema>,
  pi: Stripe.PaymentIntent
) {
  return {
    plan_id: rawMeta.plan_id ?? rawMeta.planId,
    plan_interval: (rawMeta.plan_interval ?? rawMeta.planInterval) as
      | PlanInterval
      | undefined,
    customer: String(pi.customer ?? rawMeta.customer ?? ""),
    name: rawMeta.name,
    email: rawMeta.email,
    gallery_id: rawMeta.gallery_id,
  };
}

async function checkExistingTransaction(paymentRef: string) {
  return await SubscriptionTransactions.findOne(
    { payment_ref: paymentRef },
    "status"
  )
    .lean<{ status?: string }>()
    .exec();
}

function buildTransactionData(
  pi: Stripe.PaymentIntent,
  gallery_id: string,
  customer: string
): Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> {
  const amountInUnits = Number(pi.amount) / 100;
  const nowUTC = toUTCDate(new Date());
  const domainStatus = mapStripeStatusToDomain(pi.status);

  return {
    amount: amountInUnits,
    payment_ref: pi.id,
    date: nowUTC,
    gallery_id,
    status: domainStatus,
    stripe_customer_id: customer,
  };
}

function buildUploadTracker(
  planName: PlanName,
  planInterval: PlanInterval,
  expiryDate: Date,
  existingSubscription: any
): UploadTracker {
  return {
    limit: getUploadLimitLookup(planName, planInterval),
    next_reset_date: expiryDate.toISOString(),
    upload_count: existingSubscription?.upload_tracker?.upload_count ?? 0,
  };
}

function buildSubscriptionPayload(
  nowUTC: Date,
  expiryDate: Date,
  paymentMethod: Stripe.PaymentMethod | undefined,
  customer: string,
  name: string,
  email: string,
  gallery_id: string,
  plan: any,
  plan_interval: PlanInterval,
  existingSubscription: any
) {
  const uploadTracker = buildUploadTracker(
    plan.name,
    plan_interval,
    expiryDate,
    existingSubscription
  );

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

function isSubscriptionActiveAndValid(subscription: any): boolean {
  if (!subscription) return false;

  const now = new Date();
  const expiryDate = new Date(subscription.expiry_date ?? 0);

  return subscription.status === "active" && expiryDate > now;
}

async function upsertSubscription(
  customer: string,
  subPayload: any,
  existingSubscription: any,
  session: ClientSession
) {
  if (!existingSubscription) {
    await Subscriptions.create([subPayload], { session });
    return;
  }

  if (isSubscriptionActiveAndValid(existingSubscription)) {
    await Subscriptions.updateOne(
      { stripe_customer_id: customer },
      { $set: { ...subPayload, upload_tracker: subPayload.upload_tracker } },
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

async function processSuccessfulPayment(
  pi: Stripe.PaymentIntent,
  metadata: ReturnType<typeof resolveMetadata>,
  paymentMethod: Stripe.PaymentMethod | null,
  session: ClientSession
) {
  const { plan_id, plan_interval, customer, name, email, gallery_id } =
    metadata;

  if (!plan_id || !plan_interval) {
    throw new Error("Missing plan metadata (plan_id or plan_interval)");
  }

  const [plan, existingSubscription] = await Promise.all([
    SubscriptionPlan.findOne({ plan_id }).session(session),
    Subscriptions.findOne({ stripe_customer_id: customer }).session(session),
  ]);

  if (!plan) {
    throw new Error("Plan not found");
  }

  const nowUTC = toUTCDate(new Date());
  const expiryDate = getSubscriptionExpiryDate(plan_interval);

  const subPayload = buildSubscriptionPayload(
    nowUTC,
    expiryDate,
    paymentMethod ?? undefined,
    customer,
    name,
    email,
    gallery_id,
    plan,
    plan_interval,
    existingSubscription
  );

  await upsertSubscription(customer, subPayload, existingSubscription, session);

  await AccountGallery.updateOne(
    { gallery_id },
    { $set: { subscription_status: { type: plan.name, active: true } } },
    { session }
  );
}

function getEmailForStatus(
  status: Stripe.PaymentIntent.Status,
  shouldSendSuccess: boolean,
  name: string,
  email: string
) {
  if (status === "succeeded" && shouldSendSuccess) {
    return () => sendSubscriptionPaymentSuccessfulMail({ name, email });
  }
  if (status === "processing") {
    return () => sendSubscriptionPaymentPendingMail({ name, email });
  }
  return () => sendSubscriptionPaymentFailedMail({ name, email });
}

function getResponseForStatus(
  status: Stripe.PaymentIntent.Status,
  pi: Stripe.PaymentIntent
) {
  if (status === "succeeded") {
    return NextResponse.json(
      { message: "Payment succeeded and processed", pi },
      { status: 200 }
    );
  }
  if (status === "processing") {
    return NextResponse.json(
      { message: "Payment is processing", pi },
      { status: 200 }
    );
  }
  return NextResponse.json({ message: "Payment failed", pi }, { status: 400 });
}

/* -------------------------------------------------------------------------- */
/*                                  HANDLER                                   */
/* -------------------------------------------------------------------------- */
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const isSubscriptionEnabled = (await fetchConfigCatValue(
      "subscription_creation_enabled",
      "high"
    )) as boolean;

    if (!isSubscriptionEnabled)
      throw new ForbiddenError("Subscriptions are currently disabled");
    await connectMongoDB();

    // Parse and validate request
    const parsedBody = RequestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return badRequest(parsedBody.error.flatten().fieldErrors);
    }
    const { paymentIntentId } = parsedBody.data;

    // Retrieve PaymentIntent from Stripe
    const pi = await retrievePaymentIntent(paymentIntentId);
    if (!pi) {
      return NextResponse.json(
        { message: "PaymentIntent not found" },
        { status: 404 }
      );
    }

    // Parse and validate metadata
    const metadataParse = MetadataSchema.safeParse(pi.metadata ?? {});
    if (!metadataParse.success) {
      return badRequest(metadataParse.error.flatten().fieldErrors);
    }

    const metadata = resolveMetadata(metadataParse.data, pi);

    if (!metadata.gallery_id) {
      return NextResponse.json(
        { message: "Missing gallery_id in PaymentIntent metadata" },
        { status: 400 }
      );
    }

    // Check for existing transaction (idempotency)
    const existingTxn = await checkExistingTransaction(pi.id);
    if (existingTxn?.status === "successful") {
      return NextResponse.json(
        { message: "Transaction processed successfully", pi },
        { status: 200 }
      );
    }

    // Prepare transaction data
    const txnData = buildTransactionData(
      pi,
      metadata.gallery_id,
      metadata.customer
    );

    // Process payment in atomic transaction
    const session = await mongoose.startSession();
    let shouldSendSuccessEmail = false;

    try {
      session.startTransaction();

      // Upsert transaction
      await SubscriptionTransactions.findOneAndUpdate(
        { payment_ref: pi.id },
        { $set: txnData },
        { upsert: true, new: true, session }
      );

      // Process successful payment
      if (pi.status === "succeeded") {
        const paymentMethod = pi.payment_method as Stripe.PaymentMethod | null;
        await processSuccessfulPayment(pi, metadata, paymentMethod, session);
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

    // Send email notification
    const emailFn = getEmailForStatus(
      pi.status,
      shouldSendSuccessEmail,
      metadata.name,
      metadata.email
    );
    void safeSendEmail(emailFn);

    // Return response
    return getResponseForStatus(pi.status, pi);
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("[subscription.verify] Uncaught error:", error);
    createErrorRollbarReport(
      "subscription: verify stripe subscription charge",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message ?? "Internal error" },
      { status: error_response?.status ?? 500 }
    );
  }
});
