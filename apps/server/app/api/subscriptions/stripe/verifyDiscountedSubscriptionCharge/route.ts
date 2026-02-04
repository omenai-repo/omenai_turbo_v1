import { Stripe } from "stripe";
import mongoose, { Connection } from "mongoose";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  CombinedConfig,
  SubscriptionModelSchemaTypes,
  SubscriptionTransactionModelSchemaTypes,
} from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import {
  BadRequestError,
  ServiceUnavailableError,
  ForbiddenError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { sendSubscriptionPaymentSuccessfulMail } from "@omenai/shared-emails/src/models/subscription/sendSubscriptionPaymentSuccessMail";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import {
  SubscriptionPlan,
  Subscriptions,
} from "@omenai/shared-models/models/subscriptions";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { getSubscriptionExpiryDate } from "@omenai/shared-utils/src/getSubscriptionExpiryDate";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { getUploadLimitLookup } from "@omenai/shared-utils/src/uploadLimitUtility";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { setupIntentId, galleryId, planId } = body;

    if (!setupIntentId || !galleryId || !planId) {
      return NextResponse.json(
        { message: "Invalid parameters - Please try again" },
        { status: 400 },
      );
    }

    const isSubscriptionEnabled = (await fetchConfigCatValue(
      "subscription_creation_enabled",
      "high",
    )) as boolean;

    if (!isSubscriptionEnabled) {
      throw new ServiceUnavailableError("Subscriptions are currently disabled");
    }

    // 1. Verify setup intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          message:
            "There was a problem adding your payment method. Please try again or contact support.",
        },
        { status: 400 },
      );
    }

    const paymentMethodId = setupIntent.payment_method as string | null;

    if (!paymentMethodId) {
      return NextResponse.json(
        { message: "No payment method found. Please try again." },
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (typeof paymentMethod.customer !== "string") {
      throw new BadRequestError("Invalid Stripe customer");
    }

    const customerId = paymentMethod.customer;
    const paymentRef = `discount:${customerId}:${planId}`;

    const client = await connectMongoDB();
    // Idempotency check
    const exists = await SubscriptionTransactions.exists({
      payment_ref: paymentRef,
    });

    if (exists) {
      return NextResponse.json(
        { message: "Subscription already verified" },
        { status: 200 },
      );
    }

    await processSubscriptionSuccess(planId, galleryId, paymentMethod, client);

    return NextResponse.json(
      { message: "Subscription verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "subscription: verify discounted subscription",
      error,
      errorResponse.status,
    );

    return NextResponse.json(
      { message: errorResponse.message },
      { status: errorResponse.status },
    );
  }
});

async function processSubscriptionSuccess(
  planId: string,
  gallery_id: string,
  paymentMethod: Stripe.PaymentMethod,
  client: any,
) {
  const nowUTC = toUTCDate(new Date());
  const stripeCustomerId = paymentMethod.customer as string;

  // Use a transaction session to ensure either ALL updates happen or NONE happen
  const session = await client.startSession();
  session.startTransaction();

  try {
    const [plan, existingSubscription, account] = await Promise.all([
      SubscriptionPlan.findOne({ plan_id: planId }).session(session),
      Subscriptions.findOne({ stripe_customer_id: stripeCustomerId }).session(
        session,
      ),
      AccountGallery.findOne({ gallery_id }).session(session),
    ]);

    if (!plan) {
      throw new BadRequestError(
        "Invalid plan selected - Please contact support",
      );
    }

    if (!account) {
      throw new BadRequestError("Gallery account not found");
    }

    // SECURITY CHECK: Ensure the Stripe Customer ID matches the Account
    if (
      account.stripe_customer_id &&
      account.stripe_customer_id !== stripeCustomerId
    ) {
      throw new ForbiddenError(
        "Payment method does not belong to this gallery account",
      );
    }

    // LOGIC CHECK: Enforce "New Subscribers Only"
    if (existingSubscription) {
      throw new ConflictError(
        "This discount is valid for new subscribers only.",
      );
    }

    const expiryDate = getSubscriptionExpiryDate("monthly", 2);
    const payment_ref = `discount:${stripeCustomerId}:${planId}`;

    const txnData: Omit<SubscriptionTransactionModelSchemaTypes, "trans_id"> = {
      amount: 0,
      payment_ref,
      date: nowUTC,
      gallery_id,
      status: "successful",
      stripe_customer_id: stripeCustomerId,
    };

    const subscriptionPayload: Omit<
      SubscriptionModelSchemaTypes,
      "subscription_id"
    > = {
      start_date: nowUTC,
      expiry_date: expiryDate,
      stripe_customer_id: stripeCustomerId,
      customer: {
        name: account.name,
        email: account.email,
        gallery_id,
      },
      status: "active",
      plan_details: {
        type: plan.name,
        value: plan.pricing,
        currency: plan.currency,
        interval: "monthly",
      },
      paymentMethod: paymentMethod as any,
      next_charge_params: {
        value: Number(plan.pricing.monthly_price),
        currency: "USD",
        type: plan.name,
        interval: "monthly",
        id: planId,
      },
      upload_tracker: {
        limit: getUploadLimitLookup(plan.name, "monthly", 2),
        next_reset_date: expiryDate.toISOString(),
        upload_count: 0,
      },
    };

    // 1. Create Transaction Record
    await SubscriptionTransactions.create([txnData], { session });

    // 2. Create Subscription Record
    await Subscriptions.create([subscriptionPayload], { session });

    // 3. Update Gallery Account Status
    await AccountGallery.updateOne(
      { gallery_id },
      {
        $set: {
          subscription_status: {
            type: plan.name,
            active: true,
            discount: { active: false, plan: "pro" },
          },
        },
      },
    ).session(session);

    // 4. Remove Discount from Waitlist
    await Waitlist.updateOne(
      { entityId: gallery_id, entity: "gallery" },
      { $set: { discount: null } },
    ).session(session);

    await session.commitTransaction();

    try {
      await sendSubscriptionPaymentSuccessfulMail({
        name: account.name ?? "",
        email: account.email ?? "",
      });
    } catch (emailError) {
      createErrorRollbarReport(
        "subscription success email failed",
        emailError,
        500,
      );
    }
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw error;
  } finally {
    session.endSession();
  }
}
