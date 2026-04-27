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
  discount,
}: {
  plans: (SubscriptionPlanDataTypes & { _id: ObjectId })[];
  sub_data: SubscriptionModelSchemaTypes;
  discount: boolean;
}) {
  // ── ORIGINAL STATE — UNCHANGED ──────────────────────────────────
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* ── Toggle row ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 pb-4">
        <PlanDurationTab tab={tab} setTab={setTab} />

        {discount && (
          <p className="text-[11px] tracking-wide text-[#9C8E7A]">
            {tab === "monthly"
              ? "Discount applied to your account"
              : "Switch to monthly to unlock your discount"}
          </p>
        )}
      </div>

      {/* ── Triptych plan panels ───────────────────────────────────── */}
      <div className="flex-1 px-4 pb-10">
        <div
          className="
            w-full h-full min-h-[580px]
            grid grid-cols-1 lg:grid-cols-3
            border border-[#E5E1DA]
            divide-y divide-[#E5E1DA]
            lg:divide-y-0 lg:divide-x lg:divide-[#E5E1DA]
            rounded-sm lg:rounded-sm
            overflow-hidden
          "
          style={{ gridAutoRows: "1fr" }}
        >
          {plans.map((plan, index) => {
            // Middle plan gets the featured (dark) treatment
            const isFeatured = index === Math.floor(plans.length / 2);

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
    </div>
  );
}
