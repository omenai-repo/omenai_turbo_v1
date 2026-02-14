"use client";
import React, { useState } from "react";
import Plan from "./Plan";
import PlanDurationTab from "./PlanDurationTab";
import { ObjectId } from "mongoose";
import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
  WaitListTypes,
} from "@omenai/shared-types";

export default function PlanWrapper({
  plans,
  sub_data,
  discount,
}: {
  plans: (SubscriptionPlanDataTypes & { _id: ObjectId })[];
  sub_data: SubscriptionModelSchemaTypes;
  discount: boolean;
}) {
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="flex flex-col space-y-4">
      <PlanDurationTab tab={tab} setTab={setTab} />
      <div className="flex lg:flex-wrap xl:flex-nowrap justify-center items-center gap-x-4">
        {plans.map((plan) => {
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
              discount={discount}
            />
          );
        })}
      </div>
    </div>
  );
}
