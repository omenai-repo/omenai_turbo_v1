type PlanChangeResult = {
  action: "upgrade" | "downgrade";
  shouldCharge: boolean;
};

const planTiers = {
  premium: { monthlyPrice: 400, yearlyPrice: 4000 },
  pro: { monthlyPrice: 250, yearlyPrice: 2500 },
  basic: { monthlyPrice: 150, yearlyPrice: 1500 },
};

export function determinePlanChange(
  currentPlan: string,
  currentInterval: "monthly" | "yearly",
  newPrice: number,
  newInterval: "monthly" | "yearly",
  status: "active" | "canceled" | "expired"
): PlanChangeResult {
  const currentPlanData = planTiers[currentPlan as keyof typeof planTiers];
  const currentPrice = currentPlanData[`${currentInterval}Price`];

  const planOrder = ["basic", "pro", "premium"];
  const currentPlanIndex = planOrder.indexOf(currentPlan);
  const newPlanIndex = planOrder.findIndex(
    (plan) =>
      planTiers[plan as keyof typeof planTiers][`${newInterval}Price`] ===
      newPrice
  );

  const isUpgrade = newPlanIndex >= currentPlanIndex;
  const shouldCharge = status === "expired" || newPrice > currentPrice;

  return {
    action: isUpgrade ? "upgrade" : "downgrade",
    shouldCharge,
  };
}
