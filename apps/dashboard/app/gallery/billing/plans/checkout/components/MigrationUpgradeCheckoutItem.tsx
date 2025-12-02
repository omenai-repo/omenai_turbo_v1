"use client";
import { useMemo } from "react";
import CheckoutBillingCard from "./CheckoutBillingCard";
import { differenceInCalendarDays } from "date-fns";
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
  // Derived values and memoized calculations
  const now = new Date();
  const startDate = new Date(sub_data.start_date);
  const expiryDate = new Date(sub_data.expiry_date);
  const currency = getCurrencySymbol(plan.currency);

  const totalDays = differenceInCalendarDays(expiryDate, startDate);

  const days_used = Math.min(
    differenceInCalendarDays(now, startDate),
    totalDays
  );

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

  const PriceDisplay = ({
    label,
    value,
    showMinus = false,
  }: {
    label: string;
    value: number;
    showMinus?: boolean;
  }) => (
    <div className="flex justify-between items-center">
      <p className="text-fluid-xxs font-semibold">{label}</p>
      <p className="text-fluid-xxs font-semibold">
        {showMinus
          ? `-${formatPrice(value, currency)}`
          : formatPrice(value, currency)}
      </p>
    </div>
  );

  return (
    <div className="max-w-full w-full mx-auto gap-x-8 p-4 grid grid-cols-2">
      <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-dark text-white">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_left,white,transparent_70%)]"></div>

          <p className="relative text-xs font-medium text-gray-300 uppercase tracking-widest mb-1">
            Subscription {plan_change_params.action}
          </p>

          <h1 className="relative text-lg font-semibold leading-tight">
            Omenai {plan.name} Subscription
          </h1>

          <p className="relative text-sm text-gray-300 font-medium mt-1">
            Billed {interval}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current Plan Usage */}
          <div className="bg-gray-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-fluid-xs font-normal text-gray-600">
                Current plan usage
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {days_left} day(s) left
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <PriceDisplay label="Plan cost" value={upgradeCost} />

              <div className="mt-3">
                <PriceDisplay
                  label="Prorated cost"
                  value={plan_change_params.shouldCharge ? proratedPrice : 0}
                  showMinus={plan_change_params.shouldCharge}
                />
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-slate-200" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Due today
                </span>
                <span className="text-xl font-bold text-gray-900">
                  $
                  {plan_change_params.shouldCharge
                    ? grandTotal.toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* Notice */}
          {!plan_change_params.shouldCharge && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
              <p className="text-sm text-amber-900 leading-relaxed">
                <span className="font-semibold">Note:</span> Your plan change
                will take effect at the end of your current billing cycle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing Card */}
      <CheckoutBillingCard
        sub_data={sub_data}
        interval={interval}
        plan={plan}
        amount={grandTotal}
        shouldCharge={plan_change_params.shouldCharge}
      />
    </div>
  );
}
