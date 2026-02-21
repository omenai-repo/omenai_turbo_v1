import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";

type PlanChangeResult = {
  action: "upgrade" | "downgrade";
  shouldCharge: boolean;
};

const planTiers = {
  premium: { monthlyPrice: 250, yearlyPrice: 2400 },
  pro: { monthlyPrice: 150, yearlyPrice: 1440 },
  basic: { monthlyPrice: 75, yearlyPrice: 720 },
};

export function determinePlanChange(
  currentPlan: string,
  currentInterval: "monthly" | "yearly",
  newPrice: number,
  newInterval: "monthly" | "yearly",
  status: SubscriptionModelSchemaTypes["status"],
): PlanChangeResult {
  const currentPlanData = planTiers[currentPlan as keyof typeof planTiers];
  const currentPrice = currentPlanData[`${currentInterval}Price`];

  const planOrder = ["basic", "pro", "premium"];
  const currentPlanIndex = planOrder.indexOf(currentPlan);
  const newPlanIndex = planOrder.findIndex(
    (plan) =>
      planTiers[plan as keyof typeof planTiers][`${newInterval}Price`] ===
      newPrice,
  );

  const isUpgrade = newPlanIndex >= currentPlanIndex;
  const shouldCharge = status === "expired" || newPrice > currentPrice;

  return {
    action: isUpgrade ? "upgrade" : "downgrade",
    shouldCharge,
  };
}
