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
  daysUsed: number
) => {
  const daysInYear = differenceInDays(
    endOfYear(startDate),
    startOfYear(startDate)
  );
  const daysInMonth = getDaysInMonth(startDate);

  const dailyRate =
    (planDetails.interval === "yearly"
      ? +planDetails.value.annual_price
      : +planDetails.value.monthly_price) /
    (planDetails.interval === "yearly" ? daysInYear : daysInMonth);

  const proratedPrice =
    (planDetails.interval === "yearly"
      ? +planDetails.value.annual_price
      : +planDetails.value.monthly_price) -
    daysUsed * dailyRate;

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
