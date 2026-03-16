"use client";

import PageTitle from "../../components/PageTitle";
import CardChangeCheckoutItem from "../plans/checkout/components/CardChangeCheckoutItem";
import { useQuery } from "@tanstack/react-query";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createPaymentMethodSetupIntent } from "@omenai/shared-services/subscriptions/stripe/createPaymentMethodSetupIntent";
import { PaymentMethodChangeForm } from "./CardChangePaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Ensure the Stripe key is available
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function PaymentMethodChangeWrapper() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["create_payment_method_setup_intent"],
    queryFn: async () => {
      const intent = await createPaymentMethodSetupIntent(
        user?.gallery_id as string,
        user?.email as string,
        csrf || "",
      );

      if (!intent?.isOk)
        throw new Error("Something went wrong, please contact support");
      return { client_secret: intent.client_secret };
    },
    refetchOnWindowFocus: false,
    // Prevents crashing if `user` isn't fully loaded on the first render
    enabled: !!user?.gallery_id && !!user?.email,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Load />
        <p className="text-sm text-slate-500 animate-pulse">
          Initializing secure environment...
        </p>
      </div>
    );
  }

  if (isError || !client?.client_secret) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          Failed to load secure payment portal. Please refresh or contact
          support.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full">
      {/* Main Split Container */}
      <div className="flex flex-col overflow-hidden border-gray-200 bg-white shadow-sm lg:flex-row lg:min-h-full">
        {/* LEFT SIDE: Security & Information (40%) */}
        <div className="flex w-full flex-col bg-dark p-8 text-white lg:w-[40%] lg:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded -full bg-indigo-500/20 text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Bank-Level Security
            </h2>
          </div>

          <p className="mb-10 text-slate-400 leading-relaxed">
            Your billing security is our highest priority. Omenai partners with
            Stripe to ensure your sensitive data is handled with the industry's
            most stringent compliance standards.
          </p>

          <ul className="space-y-8">
            <li className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded -full bg-slate-800 text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div>
                <strong className="block text-white">Zero Data Storage</strong>
                <p className="text-sm text-slate-400 mt-1">
                  Omenai never sees, processes, or stores your credit card
                  numbers on our servers. Data is vaulted directly with Stripe.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded -full bg-slate-800 text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div>
                <strong className="block text-white">PCI-DSS Compliant</strong>
                <p className="text-sm text-slate-400 mt-1">
                  Transactions are secured by Stripe, a certified PCI Service
                  Provider Level 1—the highest grade of payment processing
                  security.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded -full bg-slate-800 text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div>
                <strong className="block text-white">256-Bit Encryption</strong>
                <p className="text-sm text-slate-400 mt-1">
                  All communications and payment transfers are protected via
                  bank-grade TLS encryption to keep you safe from interception.
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-auto pt-10">
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Powered by Stripe
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Payment Form (60%) */}
        <div className="flex w-full flex-col justify-center p-4 lg:w-[60%]">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                New Card Details
              </h3>

              {/* Stripe Elements Provider */}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: client.client_secret,
                  // Optional: You can pass appearance options here to match Omenai's brand
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#4f46e5", // Indigo-600
                      colorBackground: "#ffffff",
                      colorText: "#1f2937",
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    },
                  },
                }}
              >
                <PaymentMethodChangeForm />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
