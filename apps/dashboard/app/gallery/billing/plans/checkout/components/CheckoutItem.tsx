import { SubscriptionPlanDataTypes } from "@omenai/shared-types";
import React from "react";

export default function CheckoutItem({
  plan,
  interval,
}: {
  plan: SubscriptionPlanDataTypes & { createdAt: string; updatedAt: string };
  interval: string;
}) {
  return (
    <div className="bg-white shadow-lg">
      <div className="w-full p-8 bg-dark text-white">
        <h1 className="text-base font-normal ">
          Omenai {plan.name} subscription
        </h1>
        <p className="mt-1 flex items-baseline text-xs font-bold tracking-tight">
          Billed {interval}
        </p>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold">Due today</p>
          <p className="text-xs font-bold">
            {interval === "monthly"
              ? `$${plan.pricing.monthly_price}`
              : `$${plan.pricing.annual_price}`}{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
