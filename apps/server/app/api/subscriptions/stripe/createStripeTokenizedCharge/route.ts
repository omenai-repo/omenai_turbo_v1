import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { NextResponse } from "next/server";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
  ServiceUnavailableError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { CombinedConfig } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const CreateStripeToken = z.object({
  amount: z.number(),
  gallery_id: z.string(),
  meta: z.any(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const isSubscriptionEnabled = (await fetchConfigCatValue(
      "subscription_creation_enabled",
      "high",
    )) as boolean;

    if (!isSubscriptionEnabled)
      throw new ServiceUnavailableError("Subscriptions are currently disabled");
    await connectMongoDB();
    const { amount, gallery_id, meta } = await validateRequestBody(
      request,
      CreateStripeToken,
    );
    const subscription_data = await Subscriptions.findOne(
      { "customer.gallery_id": gallery_id },
      "paymentMethod stripe_customer_id customer",
    );
    if (!subscription_data)
      throw new NotFoundError("No subscription record found for this user");
    // Use an existing Customer ID if this is a returning customer.

    const result = await chargeSubscription(subscription_data, amount, meta);

    if (!result.success) {
      // If 3D Secure is required, return a 402 (Payment Required) or 200 with the client_secret
      if (result.requiresAction) {
        return NextResponse.json(
          {
            requiresAction: true,
            client_secret: result.clientSecret,
            message: result.message,
          },
          { status: 402 }, // 402 Payment Required is standard here
        );
      }

      // Otherwise, it's a hard decline, throw standard bad request
      throw new BadRequestError(result.message as string);
    }
    const paymentIntent = result.data;
    //   Create a record of this transaction

    return NextResponse.json({
      message: "Payment Intent created",
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: create stripe token charge",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});

async function chargeSubscription(
  subscription_data: any,
  amount: number,
  meta: any,
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: subscription_data.stripe_customer_id,
      payment_method: subscription_data.paymentMethod.id,
      off_session: true,
      confirm: true,
      metadata: { ...meta, type: "subscription" },
    });

    return { success: true, data: paymentIntent };
  } catch (error: any) {
    console.error("[Stripe Error]:", error);

    const userFriendlyMessage = getFriendlyErrorMessage(error);
    const code = error.decline_code || error.code;

    // Check if the error requires frontend authentication
    if (code === "authentication_required" && error.payment_intent) {
      return {
        success: false,
        requiresAction: true,
        message: userFriendlyMessage,
        clientSecret: error.payment_intent.client_secret,
        errorCode: code,
      };
    }

    return {
      success: false,
      requiresAction: false,
      message: userFriendlyMessage,
      errorCode: code || "unknown_error",
    };
  }
}

// Helper to map Stripe errors to frontend-friendly text
function getFriendlyErrorMessage(error: any) {
  // Check if it's a specific card error from the issuer
  if (error.type === "StripeCardError") {
    // Stripe sometimes uses `decline_code` for specifics, and `code` for broader categories
    const code = error.decline_code || error.code;

    switch (code) {
      case "expired_card":
        return "Your card has expired. Please update your payment method.";
      case "incorrect_cvc":
      case "invalid_cvc":
        return "The security code (CVC) provided is incorrect.";
      case "incorrect_number":
      case "invalid_number":
        return "The card number provided is incorrect.";
      case "insufficient_funds":
        return "Your card has insufficient funds. Please try a different payment method.";
      case "authentication_required":
        return "Your bank requires additional authentication. Please log in and update your payment method.";
      case "card_declined":
      case "generic_decline":
        return "Your card was declined. Please contact your card issuer or try a different card.";
      case "processing_error":
        return "An error occurred while processing your card. Please try again.";
      default:
        return "There was a problem processing your payment. Please check your details and try again.";
    }
  }

  // Handle Invalid Requests (e.g., bad parameters sent to Stripe)
  if (error.type === "StripeInvalidRequestError") {
    return "We encountered a configuration issue processing your payment. Our team has been notified.";
  }

  // Fallback for API, network, or unknown errors
  return "We are temporarily unable to process payments. Please try again in a few minutes.";
}
