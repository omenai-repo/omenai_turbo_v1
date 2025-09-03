import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  const { setupIntentId, gallery_id } = await request.json();
  try {
    if (!setupIntentId || !gallery_id) {
      return NextResponse.json(
        { message: "setupIntentId and gallery_id are required" },
        { status: 400 }
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
        { status: 400 }
      );
    }

    // Step 2: Retrieve the stored payment method
    const paymentMethodId = setupIntent.payment_method as string;

    if (!paymentMethodId) {
      return NextResponse.json(
        { message: "No payment method added, please try again" },
        { status: 400 }
      );
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    const update_db = await Subscriptions.updateOne(
      { "customer.gallery_id": gallery_id },
      { $set: { paymentMethod } }
    );

    if (!update_db)
      throw new ServerError(
        "Something went wrong, please try again or contact support"
      );
    return NextResponse.json(
      { message: "Payment method updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
