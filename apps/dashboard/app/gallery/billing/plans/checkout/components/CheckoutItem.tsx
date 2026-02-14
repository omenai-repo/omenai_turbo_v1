"use client";
import React from "react";
import { SubscriptionPlanDataTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
// Assuming CheckoutBillingCard is in the same directory or adjust path
import CheckoutBillingCard from "./CheckoutBillingCard";
import InitialPaymentFormWrapper from "./InitialPaymentFormWrapper";

export default function CheckoutItem({
  plan,
  interval,
  discountEligible,
  planId,
}: {
  plan: SubscriptionPlanDataTypes & {
    createdAt: string;
    updatedAt: string;
  };
  interval: "monthly" | "yearly";
  discountEligible: boolean;
  planId: string;
}) {
  /* -------------------- PRICING & LOGIC -------------------- */
  const currency = getCurrencySymbol(plan.currency);
  const singleIntervalPrice =
    interval === "monthly"
      ? Number(plan.pricing.monthly_price)
      : Number(plan.pricing.annual_price);

  // If discount is eligible (and it's the 2-month specific offer),
  // we calculate the "Display Value" as 2 months worth of cost.
  // Otherwise, we just show the standard single interval cost.
  const displayBasePrice = discountEligible
    ? singleIntervalPrice * 2
    : singleIntervalPrice;

  const displayDiscountAmount = discountEligible ? displayBasePrice : 0;
  const totalDue = displayBasePrice - displayDiscountAmount;

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-white overflow-auto">
      {/* LEFT PANE: Brand, Welcome & Value (Dark Aesthetic) */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-[#0f172a] text-white px-16 py-8 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4 p-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-900/20">
              O
            </div>
            <span className="text-xl font-bold tracking-tighter">OMENAI</span>
          </div>

          {/* Welcome Messaging */}
          <div className="space-y-4">
            {discountEligible && (
              <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded">
                2 Months Free
              </span>
            )}
            <h1 className="text-xl md:text-2xl lg:text-2xl font-bold leading-[1.1]">
              <span className="text-emerald-500">Get started</span> with tools
              designed for your gallery.
            </h1>
            <p className="text-gray-400 text-fluid-base max-w-sm leading-relaxed">
              Join a curated marketplace designed to support galleries in
              reaching collectors.
            </p>
          </div>

          {/* Plan Highlights */}
          <ul className="space-y-4 py-4">
            {[
              "Showcase your pieces to a growing global audience",
              "Support for high-quality artwork uploads",
              "Clear insights into sales and activity",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-gray-300"
              >
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Receipt Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded p-6 space-y-4">
            {/* Line Item: Base Cost */}
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                {plan.name} Plan{" "}
                {discountEligible ? "(2 Months Value)" : `(${interval})`}
              </span>
              <span>{formatPrice(displayBasePrice, currency)}</span>
            </div>

            {/* Line Item: Discount */}
            {discountEligible && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <div className="flex text-fluid-xxs gap-x-2 items-center">
                  <span>2 Months Free</span>
                  <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    100% OFF
                  </span>
                </div>
                <span>-{formatPrice(displayDiscountAmount, currency)}</span>
              </div>
            )}

            {/* Total Due */}
            <div className="border-t border-white/10 pt-4 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-300 font-semibold uppercase tracking-wider">
                  Total Due Today
                </p>
                {discountEligible ? (
                  <p className="text-xs text-emerald-400 mt-1">
                    First 2 months free, then{" "}
                    {formatPrice(singleIntervalPrice, currency)}/mo
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">No hidden setup fees</p>
                )}
              </div>
              <span className="text-3xl font-bold tracking-tighter">
                {formatPrice(totalDue, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Global Reassurances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-8">
          <div className="p-4 bg-white border border-gray-100 rounded shadow-sm space-y-2">
            <p className="text-xs font-bold text-gray-900 uppercase">
              PCI Compliance
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              End-to-end encryption via Stripe. Your sensitive card data never
              touches our servers.
            </p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded shadow-sm space-y-2">
            <p className="text-xs font-bold text-gray-900 uppercase">
              Auto-Renewal
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Cancel anytime from your dashboard. We'll email you 7 days before
              any future renewal.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Setup & Checkout (Clean Aesthetic) */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-xl w-full space-y-4">
          <header className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Complete your setup
            </h2>
            <p className="text-gray-500 font-light text-fluid-xs leading-relaxed">
              Provide your payment details to activate your gallery
              subscription.{" "}
              {discountEligible
                ? "You won't be charged for the first 2 months."
                : ""}
            </p>
          </header>

          {/* Billing Card Wrapper */}
          <div className="bg-gray-50">
            <InitialPaymentFormWrapper
              discountEligible={discountEligible}
              planId={planId}
              interval={interval}
              amount={
                discountEligible
                  ? 0
                  : interval === "monthly"
                    ? +plan.pricing.monthly_price
                    : +plan.pricing.annual_price || 0
              }
            />
          </div>

          {/* Compliance & Security Footer */}
          <div className="space-y-8">
            <div className="flex justify-center items-center gap-8 grayscale opacity-30 pt-4">
              <span className="text-xs font-black">VISA</span>
              <span className="text-xs font-black">MASTERCARD</span>
              <span className="text-xs font-black">AMEX</span>
              <span className="text-xs font-black">APPLE PAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
