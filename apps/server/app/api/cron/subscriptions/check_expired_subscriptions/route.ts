// apps/server/app/api/cron/subscription-renewals/route.ts
import { NextResponse } from "next/server";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import Stripe from "stripe";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function cents(amount: number) {
  return Math.round(Number(amount) * 100);
}

function idempotencyKey(opts: { subscriptionId: string; attemptAt: string }) {
  return `sub_renewal:${opts.subscriptionId}:${opts.attemptAt}`;
}

type LeanExpiredSub = {
  _id: string;
  expiry_date: Date;
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

export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  await connectMongoDB();

  const now = new Date();

  try {
    // 1) Get expired subscriptions (that aren’t canceled)
    const expiredSubs: LeanExpiredSub[] = await Subscriptions.find(
      { expiry_date: { $lte: now }, status: { $ne: "canceled" } },
      "_id expiry_date stripe_customer_id customer paymentMethod next_charge_params"
    )
      .lean<LeanExpiredSub[]>()
      .exec();

    if (!expiredSubs.length) {
      return NextResponse.json(
        { message: "No expired subscriptions", attempts: 0 },
        { status: 200 }
      );
    }

    const results: Array<{
      subscriptionId: string;
      email?: string;
      ok: boolean;
      paymentIntentId?: string;
      error?: string;
    }> = [];

    // 2) Attempt renewals (Stripe handles the rest via webhooks)
    for (const sub of expiredSubs) {
      const email = sub.customer?.email;
      const amountMajor = sub.next_charge_params?.value;
      const currency = (
        sub.next_charge_params?.currency || "usd"
      ).toLowerCase();

      if (!sub.stripe_customer_id || !amountMajor) {
        results.push({
          subscriptionId: sub._id,
          email,
          ok: false,
          error: "Missing stripe_customer_id or amount",
        });
        continue;
      }

      const pm =
        typeof sub.paymentMethod === "string"
          ? sub.paymentMethod
          : sub.paymentMethod?.id;

      if (!pm) {
        results.push({
          subscriptionId: sub._id,
          email,
          ok: false,
          error: "No stored payment method",
        });
        continue;
      }

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
              type: "subscription",
              subscription_id: sub._id,
              planId: sub.next_charge_params?.id ?? "",
              planInterval: sub.next_charge_params?.interval ?? "",
              gallery_id: sub.customer?.gallery_id ?? "",
            },
          },
          {
            idempotencyKey: idempotencyKey({
              subscriptionId: sub._id,
              attemptAt: now.toISOString(),
            }),
          }
        );

        results.push({
          subscriptionId: sub._id,
          email,
          ok: true,
          paymentIntentId: pi.id,
        });
      } catch (err: any) {
        const stripeErr = err as Stripe.errors.StripeError;
        results.push({
          subscriptionId: sub._id,
          email,
          ok: false,
          error: stripeErr?.message ?? String(err),
        });
      }
    }

    return NextResponse.json(
      {
        message: "Subscription renewal attempts executed",
        attempts: results.length,
        results,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[subscription-renewals] fatal error:", e);
    return NextResponse.json(
      {
        message: "Subscription renewal cron failed",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
});
