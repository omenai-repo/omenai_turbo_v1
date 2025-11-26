import { NextResponse } from "next/server";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import Stripe from "stripe";
import pLimit from "p-limit"; // For concurrency control
import { createErrorRollbarReport } from "../../../util";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// --- helpers ---
function cents(amount: number) {
  return Math.round(Number(amount) * 100);
}

// Use subscriptionId and renewal period for idempotency
function idempotencyKey(opts: {
  subscriptionId: string;
  renewalPeriod: string;
}) {
  return `sub_renewal:${opts.subscriptionId}:${opts.renewalPeriod}`;
}

type LeanExpiredSub = {
  _id: string;
  expiry_date: Date;
  status: string;
  stripe_customer_id?: string;
  customer: { email: string; name?: string; gallery_id?: string };
  paymentMethod?: { id: string } | string;
  next_charge_params?: {
    id?: string;
    interval?: string;
    value: number;
    currency?: string;
  };
};

const MAX_CONCURRENT_RENEWALS = 5;
const MAX_RETRIES = 2;
const PAGE_SIZE = 100;

async function renewSubscription(
  sub: LeanExpiredSub,
  renewalPeriod: string
): Promise<{
  subscriptionId: string;
  email?: string;
  ok: boolean;
  paymentIntentId?: string;
  error?: string;
}> {
  const email = sub.customer?.email;
  const amountMajor = sub.next_charge_params?.value;
  const currency = (sub.next_charge_params?.currency || "usd").toLowerCase();

  if (!sub.stripe_customer_id || !amountMajor) {
    return {
      subscriptionId: sub._id,
      email,
      ok: false,
      error: "Missing stripe_customer_id or amount",
    };
  }

  const pm =
    typeof sub.paymentMethod === "string"
      ? sub.paymentMethod
      : sub.paymentMethod?.id;

  if (!pm) {
    return {
      subscriptionId: sub._id,
      email,
      ok: false,
      error: "No stored payment method",
    };
  }

  let lastError: any = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const pi = await stripe.paymentIntents.create(
        {
          amount: cents(amountMajor),
          currency,
          customer: sub.stripe_customer_id,
          payment_method: pm,
          off_session: true,
          confirm: true,
          metadata: {
            type: "subscription_renewal",
            subscription_id: sub._id,
            planId: sub.next_charge_params?.id ?? "",
            planInterval: sub.next_charge_params?.interval ?? "",
            gallery_id: sub.customer?.gallery_id ?? "",
          },
        },
        {
          idempotencyKey: idempotencyKey({
            subscriptionId: sub._id,
            renewalPeriod,
          }),
        }
      );
      return {
        subscriptionId: sub._id,
        email,
        ok: true,
        paymentIntentId: pi.id,
      };
    } catch (err: any) {
      lastError = err;
      // Retry only on transient Stripe errors
      if (
        attempt < MAX_RETRIES &&
        (err?.type === "rate_limit_error" ||
          err?.type === "api_connection_error" ||
          err?.type === "idempotency_error" ||
          err?.code === "lock_timeout")
      ) {
        await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
        continue;
      }
      break;
    }
  }
  const stripeErr = lastError as Stripe.errors.StripeError;
  return {
    subscriptionId: sub._id,
    email,
    ok: false,
    error: stripeErr?.message ?? "Payment renewal failed",
  };
}

export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  await connectMongoDB();

  const now = new Date();
  const renewalPeriod = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;

  try {
    // 1) Mark overdue subs as expired (ignore canceled ones)
    await Subscriptions.updateMany(
      { expiry_date: { $lte: now }, status: { $ne: "canceled" } },
      { $set: { status: "expired" } }
    );

    let page = 0;
    let totalAttempts = 0;
    let allResults: Array<any> = [];

    while (true) {
      // 2) Fetch expired subs to attempt renewal (paginated)
      const expiredSubs: LeanExpiredSub[] = await Subscriptions.find(
        { expiry_date: { $lte: now }, status: "expired" },
        "_id expiry_date stripe_customer_id customer paymentMethod next_charge_params"
      )
        .lean<LeanExpiredSub[]>()
        .skip(page * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .exec();

      if (!expiredSubs.length) break;

      // 3) Mark galleries inactive (subscription expired)
      const emailsToUpdate = expiredSubs
        .map((s) => s.customer?.email)
        .filter(Boolean);

      if (emailsToUpdate.length) {
        await AccountGallery.updateMany(
          { email: { $in: emailsToUpdate } },
          { $set: { "subscription_status.active": false } }
        );
      }

      // 4) Attempt to renew subs via Stripe (parallel, limited concurrency)
      const limit = pLimit(MAX_CONCURRENT_RENEWALS);
      const renewalPromises = expiredSubs.map((sub) =>
        limit(() => renewSubscription(sub, renewalPeriod))
      );
      const results = await Promise.allSettled(renewalPromises);

      const formattedResults = results.map((r) =>
        r.status === "fulfilled"
          ? r.value
          : { ok: false, error: "Internal error" }
      );

      allResults = allResults.concat(formattedResults);
      totalAttempts += formattedResults.length;

      // If less than PAGE_SIZE, we're done
      if (expiredSubs.length < PAGE_SIZE) break;
      page++;
    }

    // 5) Done (webhook will handle payment success/failure updates)
    return NextResponse.json(
      {
        message: "Expired subscriptions updated, renewal attempts made",
        attempts: totalAttempts,
        results: allResults,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[subscription-renewals] fatal error:", e);
    createErrorRollbarReport(
      "Cron: Subscription Renewals - Process expired subscriptions",
      e as any,
      500
    );
    return NextResponse.json(
      {
        message: "Subscription renewal cron failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
