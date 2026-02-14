import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import {
  ServerError,
  ServiceUnavailableError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const UpdatePaymentMethodSchema = z.object({
  setupIntentId: z.string(),
  gallery_id: z.string(),
});
export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request,
) {
  try {
    const isSubscriptionEnabled = (await fetchConfigCatValue(
      "subscription_creation_enabled",
      "high",
    )) as boolean;

    if (!isSubscriptionEnabled)
      throw new ServiceUnavailableError("Subscriptions are currently disabled");

    const { setupIntentId, gallery_id } = await validateRequestBody(
      request,
      UpdatePaymentMethodSchema,
    );

    if (!setupIntentId || !gallery_id) {
      return NextResponse.json(
        { message: "setupIntentId and gallery_id are required" },
        { status: 400 },
      );
    }

    // Step 1: Verify the setup intent with Stripe
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    // Check if setup intent is successful
    if (setupIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          message: `There was a problem adding your payment method, please try again or contact support for assistance`,
        },
        { status: 400 },
      );
    }

    // Step 2: Retrieve the stored payment method
    const paymentMethodId = setupIntent.payment_method as string;

    if (!paymentMethodId) {
      return NextResponse.json(
        { message: "No payment method added, please try again" },
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    const update_db = await Subscriptions.updateOne(
      { "customer.gallery_id": gallery_id },
      { $set: { paymentMethod } },
    );

    if (!update_db)
      throw new ServerError(
        "Something went wrong, please try again or contact support",
      );
    return NextResponse.json(
      { message: "Payment method updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: update payment method",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
