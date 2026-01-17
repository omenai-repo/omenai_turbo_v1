"use client";
import { useMemo } from "react";
import CheckoutBillingCard from "./CheckoutBillingCard";
import { differenceInCalendarDays, format } from "date-fns";
import {
  SubscriptionPlanDataTypes,
  SubscriptionModelSchemaTypes,
} from "@omenai/shared-types";
import { determinePlanChange } from "@omenai/shared-utils/src/determinePlanChange";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { calculateSubscriptionPricing } from "@omenai/shared-utils/src/calculateSubscriptionPricing";

export default function MigrationUpgradeCheckoutItem({
  plan,
  interval,
  sub_data,
}: {
  plan: SubscriptionPlanDataTypes & {
    createdAt: string;
    updatedAt: string;
    _id: string;
  };
  interval: "yearly" | "monthly";
  sub_data: SubscriptionModelSchemaTypes & {
    created?: string;
    updatedAt?: string;
  };
}) {
  const now = new Date();
  const startDate = new Date(sub_data.start_date);
  const expiryDate = new Date(sub_data.expiry_date);
  const currency = getCurrencySymbol(plan.currency);

  const totalDays = differenceInCalendarDays(expiryDate, startDate);
  const days_used = Math.min(
    differenceInCalendarDays(now, startDate),
    totalDays
  );
  const progressPercentage = totalDays > 0 ? (days_used / totalDays) * 100 : 0;
  const days_left = Math.max(totalDays - days_used, 0);

  const { proratedPrice, upgradeCost, grandTotal } = useMemo(
    () =>
      calculateSubscriptionPricing(
        startDate,
        interval,
        sub_data.plan_details,
        plan,
        days_used,
        totalDays
      ),
    [startDate, interval, sub_data.plan_details, plan, days_used, totalDays]
  );

  const plan_change_params = useMemo(() => {
    if (!sub_data) return { action: "", shouldCharge: false };
    return determinePlanChange(
      sub_data.plan_details.type.toLowerCase(),
      sub_data.plan_details.interval.toLowerCase() as "yearly" | "monthly",
      interval === "yearly"
        ? +plan.pricing.annual_price
        : +plan.pricing.monthly_price,
      interval,
      sub_data.status
    );
  }, [sub_data, interval, plan.pricing]);

  const capitalize = (word = "") =>
    word ? word[0].toUpperCase() + word.slice(1) : "";
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-white overflow-hidden">
      {/* LEFT PANE: Order Summary & Context (Dark Theme) */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-[#0f172a] text-white py-4 px-16 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6 p-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-xl">
              O
            </div>
            <span className="text-xl font-bold tracking-tight">OMENAI</span>
          </div>

          {/* Plan Info */}
          <div className="space-y-4">
            <h1 className="text-fluid-3xl font-bold leading-tight">
              {capitalize(plan_change_params.action)} to{" "}
              <span className="text-blue-500">{plan.name}</span>
            </h1>
            {plan_change_params.shouldCharge ? (
              <p className="text-gray-400 text-fluid-base max-w-sm">
                Unlock higher upload limits and premium gallery features
                tailored for your growth.
              </p>
            ) : (
              <p className="text-gray-400 text-fluid-base max-w-sm">
                Switch to a simpler plan that fits your current needs, while
                keeping full access to your existing work.
              </p>
            )}
          </div>

          {/* Usage Visualization */}
          <div className="bg-white/5 border border-white/10 rounded p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 uppercase tracking-widest font-semibold">
                Current Cycle
              </span>
              <span className="text-blue-400 font-medium">
                {days_left} days left
              </span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Started {format(startDate, "MMM d, yyyy")}</span>
              <span>Renews {format(expiryDate, "MMM d, yyyy")}</span>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="space-y-4 pt-6">
            <div className="flex justify-between text-gray-300">
              <span>
                {plan.name} Plan ({interval})
              </span>
              <span>{formatPrice(upgradeCost, currency)}</span>
            </div>
            {plan_change_params.shouldCharge && (
              <div className="flex justify-between text-green-400 italic">
                <span>Prorated credit (unused time)</span>
                <span>-{formatPrice(proratedPrice, currency)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-4 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-400">Total amount due</p>
                <p className="text-xs text-gray-500">
                  Includes all applicable taxes
                </p>
              </div>
              <span className="text-fluid-3xl font-bold">
                {plan_change_params.shouldCharge
                  ? formatPrice(grandTotal, currency)
                  : "$0.00"}
              </span>
            </div>
            {!plan_change_params.shouldCharge && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded shadow-sm">
                <p className="text-sm text-amber-900 leading-relaxed">
                  <span className="font-semibold">Note:</span> Your plan change
                  will take effect at the end of your current billing cycle.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Reassurances */}
        <div className=" space-y-3 p-8 border-t border-white/5">
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 5.618V12c0 5.385 4.365 9.75 9.75 9.75s9.75-4.365 9.75-9.75V5.618l-.382-.032z"
              />
            </svg>
            <span>Bank-level 256-bit encryption</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Cancel or switch plans anytime</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Checkout & Payment (Light Theme) */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex items-center justify-center p-8 md:p-12 lg:p-24 overflow-y-auto">
        <div className="max-w-xl w-full space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Payment details
            </h2>
            <p className="text-gray-500 font-medium">
              Complete your upgrade by providing your payment information below.
            </p>
          </div>

          <div className="bg-gray-50 p-1 rounded">
            <CheckoutBillingCard
              sub_data={sub_data}
              interval={interval}
              plan={plan}
              amount={grandTotal}
              shouldCharge={plan_change_params.shouldCharge}
            />
          </div>

          {/* Compliance & Trust badges */}
          <div className="space-y-6 pt-6">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded flex items-start gap-4">
              <div className="p-2 bg-white rounded shadow-sm">🔒</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-bold block text-slate-800 mb-1 uppercase tracking-tighter">
                  PCI-DSS Compliant
                </span>
                Your payment information is processed securely by Stripe. We do
                not store your full card details on our servers to ensure
                maximum safety.
              </p>
            </div>

            <div className="flex justify-center items-center gap-8 opacity-40 grayscale pointer-events-none">
              <span className="text-sm font-black italic">VISA</span>
              <span className="text-sm font-black italic">Mastercard</span>
              <span className="text-sm font-black italic">AMEX</span>
              <span className="text-sm font-black italic font-serif">
                Stripe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
