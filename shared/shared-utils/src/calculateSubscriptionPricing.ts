import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";
import {
  differenceInDays,
  endOfYear,
  startOfYear,
  getDaysInMonth,
} from "date-fns";

export const calculateSubscriptionPricing = (
  startDate: Date,
  interval: "yearly" | "monthly",
  planDetails: SubscriptionModelSchemaTypes["plan_details"],
  newPlan: SubscriptionPlanDataTypes,
  daysUsed: number,
  totalDays: number,
  isSubscriptionDiscount: boolean,
) => {
  const isYearly = planDetails.interval === "yearly";
  const planPrice = isYearly
    ? +planDetails.value.annual_price
    : +planDetails.value.monthly_price;

  const dailyRate = planPrice / totalDays;

  const proratedPrice = isSubscriptionDiscount
    ? 0
    : Math.max(planPrice - daysUsed * dailyRate, 0);

  const upgradeCost =
    interval === "monthly"
      ? +newPlan.pricing.monthly_price
      : +newPlan.pricing.annual_price;

  const total = upgradeCost - proratedPrice;
  const grandTotal = Math.round((total + Number.EPSILON) * 100) / 100;

  return {
    proratedPrice,
    upgradeCost,
    grandTotal,
  };
};
