import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { dashboard_url } from "@omenai/url-config/src/config";

export const PaymentMethodChangeForm = () => {
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

      const { error: stripeError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `http://localhost:5000/gallery/billing/card/verification`,
        },
      });

      if (stripeError) {
        setError(stripeError.message ?? "An unknown error occurred");
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      <div className="p-4 border rounded-lg">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed disabled:bg-dark/30 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none  rounded-md h-[35px] p-6 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer"
      >
        {isProcessing ? "Processing..." : `Update payment method`}
      </button>
    </form>
  );
};
