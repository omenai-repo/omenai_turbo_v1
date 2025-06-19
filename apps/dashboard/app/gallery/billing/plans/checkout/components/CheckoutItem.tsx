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
      <div className="w-full p-8 bg-dark rounded-[10px] text-white">
        <h1 className="text-fluid-base font-bold ">
          Omenai {plan.name} subscription
        </h1>
        <p className="mt-1 flex items-baseline text-fluid-xs font-medium tracking-tight">
          Billed {interval}
        </p>
      </div>

      <div className="p-5 my-4 rounded-[10px]">
        <div className="flex justify-between items-center">
          <p className="text-fluid-xs font-bold">Due today</p>
          <p className="text-fluid-xs font-bold">
            {interval === "monthly"
              ? `$${plan.pricing.monthly_price}`
              : `$${plan.pricing.annual_price}`}{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
