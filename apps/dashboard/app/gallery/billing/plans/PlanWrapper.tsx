"use client";
import React, { useState } from "react";
import Plan from "./Plan";
import PlanDurationTab from "./PlanDurationTab";
import { ObjectId } from "mongoose";
import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";

export default function PlanWrapper({
  plans,
  sub_data,
}: {
  plans: SubscriptionPlanDataTypes[];
  sub_data: SubscriptionModelSchemaTypes & {
    created: string;
    updatedAt: string;
  };
}) {
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="">
      <PlanDurationTab tab={tab} setTab={setTab} />
      <div className="flex lg:flex-wrap xl:flex-nowrap justify-center items-center gap-x-4">
        {plans.map((plan: SubscriptionPlanDataTypes & any) => {
          return (
            <Plan
              key={plan.plan_id}
              name={plan.name}
              pricing={plan.pricing}
              benefits={plan.benefits}
              tab={tab}
              plan_id={plan.plan_id}
              currency={plan.currency}
              id={plan._id}
              sub_data={sub_data}
            />
          );
        })}
      </div>
    </div>
  );
}
