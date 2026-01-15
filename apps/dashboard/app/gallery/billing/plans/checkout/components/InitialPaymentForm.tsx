"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import { dashboard_url } from "@omenai/url-config/src/config";
import React from "react";
interface SubscriptionFormProps {
  isDiscounted: boolean;
  amount: number;
  planId: string;
}

export function PaymentForm({
  isDiscounted,
  amount,
  planId,
}: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet");
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method

      event.preventDefault();

      if (!stripe || !elements) return;

      let baseError;
      if (isDiscounted) {
        const returnUrl = new URL(
          `${dashboard_url()}/gallery/billing/plans/checkout/verification`
        );

        returnUrl.searchParams.set("isDiscounted", String(isDiscounted));
        returnUrl.searchParams.set("planId", planId);

        const { error: stripeError } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: returnUrl.toString(),
          },
        });

        baseError = stripeError;
      } else {
        const { error: stripeError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${dashboard_url()}/gallery/billing/plans/checkout/verification`,
          },
        });
        baseError = stripeError;
      }

      if (baseError) {
        // Show error to user
        setError(baseError.message || "Payment failed");
      } else {
        console.log("Payment successful");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }

    setIsProcessing(false);
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 rounded-3xl">
        <h3 className="text-green-800 font-semibold">Subscription Created!</h3>
        <p className="text-green-600">
          Your subscription has been successfully activated.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div className="p-4 ">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-3xl text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed disabled:bg-dark/30 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none  rounded-full h-[35px] p-6 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer mb-4"
      >
        {isProcessing
          ? "Processing..."
          : isDiscounted
            ? "Subscribe to this plan"
            : `Subscribe for $${amount}`}
      </button>
    </form>
  );
}
