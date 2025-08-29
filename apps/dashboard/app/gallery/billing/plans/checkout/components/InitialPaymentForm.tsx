"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { createSubscriptionPaymentIntent } from "@omenai/shared-services/subscriptions/stripe/createSubscriptionPaymentIntent";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { dashboard_url } from "@omenai/url-config/src/config";
interface SubscriptionFormProps {
  planId: string;
  amount: number;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export function PaymentForm({ planId, amount }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user, csrf } = useAuth({ requiredRole: "gallery" });

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

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${dashboard_url()}/gallery/billing/plans/checkout/verification`,
        },
      });

      if (error) {
        console.error(error.message);
        // Show error to user
        setError(error.message || "Payment failed");
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
      <div className="p-6 bg-green-50 rounded-lg">
        <h3 className="text-green-800 font-semibold">Subscription Created!</h3>
        <p className="text-green-600">
          Your subscription has been successfully activated.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : `Subscribe for $${amount / 100}`}
      </button>
    </form>
  );
}
