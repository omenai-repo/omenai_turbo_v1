import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import {
  anonymizeUsername,
  createFailedTaskJob,
  DeletionReturnType,
  validateTargetId,
} from "../utils";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import type { Stripe } from "stripe";

/*
 * ====================================================================
 * STRIPE SUBSCRIPTION DELETION PROTOCOL
 * ====================================================================
 *
 * AIM:
 * 1. Cancel all active subscriptions for the user.
 * 2. Detach all saved payment methods from the Stripe Customer.
 * 3. Anonymize the local Subscription document as per compliance rules.
 *
 * DESIGN:
 * Follows an eventual consistency model. This service does NOT
 * throw errors. It logs failed external operations to the
 * `FailedJob` collection for a cron to retry. The local
 * anonymization will proceed regardless of external failures.
 *
 */

/**
 * Handles subscription deletion and anonymization.
 * This is a "parallel" service and must not throw errors.
 */
export async function subscriptionDeletionProtocol(
  targetId: string
): Promise<DeletionReturnType> {
  const stats = {
    failedJobCreations: 0,
    anonymizedSubscription: false,
    subscriptionCanceled: false,
    paymentMethodsDetached: false,
  };

  try {
    // Step 1: Validate Target ID
    const checkIdvalidity = validateTargetId(targetId);
    if (!checkIdvalidity.success) {
      console.error(
        `Invalid targetId for subscriptionDeletionProtocol: ${targetId}`
      );
      // We could create a DLQ job here, but for now, we just exit.
      return {
        success: false,
        count: { ...stats },
        note: "An error occured",
        error: "Invalid target ID",
      };
    }

    // Step 2: Find user's subscription document

    const subscription = (await Subscriptions.findOne(
      { "customer.gallery_id": targetId },
      "customer.email stripe_customer_id subscription_id"
    ).lean()) as unknown as {
      stripe_customer_id?: string;
      subscription_id?: string;
      customer?: { email?: string };
    };

    if (!subscription) {
      return {
        success: true,
        count: { ...stats },
        note: "No subscription found.",
      };
    }

    const stripeCustomerId = subscription.stripe_customer_id;
    const customerEmail = subscription.customer?.email ?? null;

    // === FAULT-ISOLATED TASK: DETACH STRIPE PAYMENT METHODS ===
    if (stripeCustomerId) {
      try {
        // 1. Find all payment methods for this customer
        const paymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: "card",
        });

        // 2. Detach all of them in parallel
        await Promise.all(
          paymentMethods.data.map((pm: Stripe.PaymentMethod) =>
            stripe.paymentMethods.detach(pm.id)
          )
        );
        stats.paymentMethodsDetached = true;
      } catch (error) {
        console.error(
          `Failed to detach payment methods for Stripe customer ${stripeCustomerId}:`,
          (error as Error).message
        );
        const created = await createFailedTaskJob({
          error: `Stripe API Error: ${(error as Error).message}`,
          payload: { stripeCustomerId, customerEmail, targetId },
          jobType: "detach_stripe_payment_methods",
          taskId: `subscription_service:${stripeCustomerId}`,
        });
        if (!created) stats.failedJobCreations++;
      }
    }

    // === MAIN TASK: ANONYMIZE LOCAL DB (Always Runs) ===

    const anonymizeResult = await Subscriptions.updateOne(
      { owner_id: targetId }, // Find the document again to be safe
      {
        $set: {
          "customer.name": anonymizeUsername(targetId),
          "customer.phone_number": null,
          "customer.email": null,
          paymentMethod: null,
        },
      }
    );

    if (anonymizeResult.modifiedCount === 1) {
      stats.anonymizedSubscription = true;
    } else {
      // We create a retry job for our own retry service.
      console.error(
        `Failed to anonymize local subscription for user ${targetId}. Matched: ${anonymizeResult.matchedCount}`
      );
      const created = await createFailedTaskJob({
        error: `DB Error: Could not anonymize subscription. Matched: ${anonymizeResult.matchedCount}`,
        payload: { targetId, customerEmail },
        jobType: "anonymize_subscription_data",
        taskId: `sub_service:${targetId}`,
      });
      if (!created) stats.failedJobCreations++;
    }

    return {
      success: true,
      count: { ...stats },
      note: "Deletion protocol successfully executed",
    };
  } catch (error) {
    console.error(
      `Fatal error in subscriptionDeletionProtocol for user ${targetId}:`,
      (error as Error).message
    );

    return {
      success: false,
      count: { ...stats },
      note: "An error occured during deletion, Manual intervention in progress",
      error: (error as Error).message,
    };
  }
}
