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
import { useMemo } from "react";

// New utility function

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
    created: string;
    updatedAt: string;
  };
}) {
  const now = new Date();
  const startDate = new Date(sub_data.start_date);
  const expiryDate = new Date(sub_data.expiry_date); // 💡 use actual expiry
  const currency = getCurrencySymbol(plan.currency);

  // Use actual duration based on expiry
  const totalDays = differenceInCalendarDays(expiryDate, startDate);
  const days_used = Math.min(
    differenceInCalendarDays(now, startDate),
    totalDays
  );
  const days_left = Math.max(totalDays - days_used, 0); // Just in case

  // Memoize calculations
  const { proratedPrice, upgradeCost, grandTotal } = useMemo(
    () =>
      calculateSubscriptionPricing(
        startDate,
        interval,
        sub_data.plan_details,
        plan,
        days_used,
        totalDays // 🆕 pass the actual total
      ),
    [startDate, interval, sub_data.plan_details, plan, days_used, totalDays]
  );

  // Memoize plan change parameters
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

  // Extract price display component
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
      <p className="text-fluid-xs font-semibold">{label}</p>
      <p className="text-fluid-xs font-semibold">
        {showMinus
          ? `-${formatPrice(value, currency)}`
          : formatPrice(value, currency)}
      </p>
    </div>
  );

  return (
    <>
      <div className="max-w-lg space-y-6 p-4">
        {/* Main Subscription Card */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header Section */}
          <div className="bg-gray-900 p-6 text-white">
            <p className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
              Subscription {plan_change_params.action}
            </p>
            <h1 className="text-xl font-bold mb-2">
              Omenai {plan.name} subscription
            </h1>
            <p className="text-sm text-gray-300 font-medium">
              Billed {interval}
            </p>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Current Plan Usage */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Current plan usage
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {days_left} day(s) left
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <PriceDisplay label="Plan cost" value={upgradeCost} />
                <PriceDisplay
                  label="Prorated cost"
                  value={plan_change_params.shouldCharge ? proratedPrice : 0}
                  showMinus={plan_change_params.shouldCharge}
                />

                {/* Total Amount - Highlighted */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Due today
                    </span>
                    <span className="text-lg font-bold text-gray-900">
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
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm font-medium text-amber-800">
                    <span className="font-semibold">Note:</span> Your plan
                    change will take effect at the end of your current billing
                    cycle.
                  </p>
                </div>
              )}
            </div>
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
    </>
  );
}
