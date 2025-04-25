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
      <p className="text-[14px] font-semibold">{label}</p>
      <p className="text-[14px] font-semibold">
        {showMinus
          ? `-${formatPrice(value, currency)}`
          : formatPrice(value, currency)}
      </p>
    </div>
  );

  return (
    <>
      <div className="bg-white shadow-md rounded-sm">
        <div className="w-full p-5 bg-dark text-white rounded-[20px]">
          <p className="text-[13px] font-normal">
            Subscription {plan_change_params.action}
          </p>
          <h1 className="text-14px font-semibold">
            Omenai {plan.name} subscription
          </h1>
          <p className="mt-1 flex items-baseline text-[14px] font-semibold tracking-tight">
            Billed {interval}
          </p>
        </div>

        <div className="p-5 flex flex-col space-y-3 my-4 rounded-[20px]">
          <div className="flex justify-between items-center text-[14px] font-semibold">
            <p>Current plan usage</p>
            <p>{days_left} day(s) left</p>
          </div>

          <PriceDisplay label="Plan cost" value={upgradeCost} />
          <PriceDisplay
            label="Prorated cost"
            value={plan_change_params.shouldCharge ? proratedPrice : 0}
            showMinus={plan_change_params.shouldCharge}
          />
          <PriceDisplay
            label="Due today"
            value={plan_change_params.shouldCharge ? grandTotal : 0}
          />

          {!plan_change_params.shouldCharge && (
            <p className="text-[13px] font-bold text-red-600 mt-5">
              NOTE: Your plan change will take effect at the end of your current
              billing cycle.
            </p>
          )}
        </div>
      </div>
      <CheckoutBillingCard
        sub_data={sub_data}
        interval={interval}
        plan={plan}
        amount={grandTotal}
        shouldCharge={plan_change_params.shouldCharge}
      />
    </>
  );
}
