import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import type { Stripe } from "stripe";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";

async function detachPaymentMethods(job: FailedCronJobTypes) {
  try {
    const { stripeCustomerId } = job.payload;

    if (!stripeCustomerId) {
      return {
        success: false,
        jobId: job.jobId,
        error: "Missing stripeCustomerId in payload",
      };
    }

    // Find all payment methods for this customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
    });

    // If no payment methods found, consider it successful
    if (paymentMethods.data.length === 0) {
      return {
        success: true,
        jobId: job.jobId,
        note: "No payment methods to detach",
      };
    }

    // Detach all payment methods in parallel
    await Promise.all(
      paymentMethods.data.map((pm: Stripe.PaymentMethod) =>
        stripe.paymentMethods.detach(pm.id)
      )
    );

    return {
      success: true,
      jobId: job.jobId,
      note: `Detached ${paymentMethods.data.length} payment method(s)`,
    };
  } catch (error) {
    // Increment retry count on failure
    await FailedJob.updateOne(
      { jobId: job.jobId },
      { $inc: { retryCount: 1 } }
    );

    return {
      success: false,
      jobId: job.jobId,
      error: error instanceof Error ? error.message : "Unknown Stripe error",
    };
  }
}

export async function stripePaymentMethodsService(jobs: FailedCronJobTypes[]) {
  try {
    const promises = jobs.map((job) => detachPaymentMethods(job));
    const results = await Promise.allSettled(promises);
    const successfulJobIds: string[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.success) {
        successfulJobIds.push(result.value.jobId);
        console.log(
          `Job ${result.value.jobId}: ${result.value.note || "Success"}`
        );
      } else if (result.status === "fulfilled") {
        console.warn(`Job ${result.value.jobId} failed: ${result.value.error}`);
      }
    });

    if (successfulJobIds.length > 0) {
      await FailedJob.deleteMany({
        jobId: { $in: successfulJobIds },
      });
      console.log(`Cleaned up ${successfulJobIds.length} successful jobs`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
