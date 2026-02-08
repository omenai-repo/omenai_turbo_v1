"use client";

import Link from "next/link";
import { ObjectId } from "mongoose";
import { determinePlanChange } from "@omenai/shared-utils/src/determinePlanChange";
import { useSearchParams } from "next/navigation";
import {
  SubscriptionPlanDataTypes,
  SubscriptionModelSchemaTypes,
  WaitListTypes,
} from "@omenai/shared-types";
import React from "react";

/* ----------------------------- CONFIG (unchanged) ----------------------------- */

const PLAN_DESCRIPTIONS = {
  Basic: "Essential features to get started",
  Pro: "Perfect for growing businesses",
  Premium: "Advanced features for scale",
};

const calculateYearlySavings = (monthlyPrice: string, annualPrice: string) =>
  (Number(monthlyPrice) * 12 - Number(annualPrice)).toFixed(0);

/* ----------------------------- HELPERS (unchanged) ----------------------------- */

const getPlanChangeParams = (
  subData: SubscriptionModelSchemaTypes | null,
  tab: "monthly" | "yearly",
  pricing: { monthly_price: string; annual_price: string },
) => {
  if (subData === null) return { action: "", shouldCharge: false };

  const price =
    tab === "yearly" ? +pricing.annual_price : +pricing.monthly_price;

  const { action, shouldCharge } = determinePlanChange(
    subData.plan_details.type.toLowerCase(),
    subData.plan_details.interval.toLowerCase() as "yearly" | "monthly",
    price,
    tab,
    subData.status,
  );

  return { action, shouldCharge };
};

const getButtonText = (
  subData: SubscriptionModelSchemaTypes | null,
  planAction: string | null,
  planName: string,
  tab: "monthly" | "yearly",
) => {
  if (subData === null) return "Get started";
  if (subData.status === "expired") return "Get started";
  if (planAction === "reactivation") return "Activate plan";

  const isDifferentPlan = subData.plan_details.type !== planName;
  const isSamePlanDifferentInterval =
    subData.plan_details.type === planName &&
    subData.plan_details.interval !== tab;

  if (isDifferentPlan || isSamePlanDifferentInterval) return "Migrate";

  return "Subscribed";
};

const isButtonDisabled = (
  subData: SubscriptionModelSchemaTypes | null,
  planName: string,
  tab: "monthly" | "yearly",
  planAction: string | null,
) => {
  if (subData === null) return false;
  if (planAction !== null) return false;
  if (subData.status !== "active") return false;

  return (
    subData.plan_details.type === planName &&
    subData.plan_details.interval === tab
  );
};

/* ----------------------------- UI ATOMS ----------------------------- */

const PlanBadge = ({ planName }: { planName: string }) =>
  planName === "Pro" ? (
    <div className="absolute top-5 right-5 rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white">
      Most popular
    </div>
  ) : null;

/* 🔹 UPDATED Forfeit Warning — Reflects the 2-month offer */
const ForfeitWarning = ({ targetPlan }: { targetPlan: string }) => (
  <div className="mb-4 rounded bg-amber-50 border border-amber-200 p-3">
    <div className="flex gap-2">
      <span className="text-amber-600">⚠️</span>
      <p className="text-[11px] leading-relaxed font-medium text-amber-800">
        Selecting this plan will <span className="font-bold">forfeit</span> your
        one-time <span className="font-bold">2-month free trial</span> on the
        monthly <span className="capitalize font-bold">{targetPlan}</span> plan.
      </p>
    </div>
  </div>
);

/* ----------------------------- COMPONENT ----------------------------- */

export default function Plan({
  name,
  pricing,
  benefits,
  tab,
  plan_id,
  id,
  sub_data,
  discount,
}: SubscriptionPlanDataTypes & {
  tab: "monthly" | "yearly";
  id: ObjectId;
  sub_data: SubscriptionModelSchemaTypes;
  discount: boolean;
}) {
  const searchParams = useSearchParams();
  const plan_action = searchParams.get("plan_action");

  const plan_change_params = getPlanChangeParams(sub_data, tab, pricing);
  const buttonText = getButtonText(sub_data, plan_action, name, tab);
  const isDisabled = isButtonDisabled(sub_data, name, tab, plan_action);

  const isFeatured = name === "Pro";

  /* -------------------- DISCOUNT CHECK -------------------- */
  // Logic remains the same, but the UI presentation changes below
  const isEligibleForDiscount =
    discount && name.toLowerCase() === "pro" && tab === "monthly";

  const showForfeitWarning = discount && !isEligibleForDiscount;

  // 🔹 UPDATED: CTA text specific to the 2-month offer
  const finalButtonText =
    isEligibleForDiscount && !isDisabled ? "Claim 2 months free" : buttonText;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        className={`relative rounded bg-white p-8 transition ${
          isFeatured
            ? "shadow-xl ring-1 ring-slate-900"
            : "shadow-sm ring-1 ring-slate-200"
        }`}
      >
        <div className="w-full flex justify-between items-center">
          <PlanBadge planName={name} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {PLAN_DESCRIPTIONS[name as keyof typeof PLAN_DESCRIPTIONS]}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-slate-900">
              $
              {isEligibleForDiscount
                ? "0"
                : tab === "monthly"
                  ? pricing.monthly_price
                  : pricing.annual_price}
            </span>

            {/* 🔹 UPDATED: Sub-text for pricing unit */}
            <span className="text-sm text-slate-500">
              {isEligibleForDiscount
                ? "/mo for 2 months"
                : `/${tab === "monthly" ? "month" : "year"}`}
            </span>
          </div>

          {/* 🔹 UPDATED: Green Pricing Benefits Text */}
          {isEligibleForDiscount ? (
            <p className="mt-1 text-xs font-medium text-emerald-600">
              Then ${pricing.monthly_price}/mo · One-time offer
            </p>
          ) : (
            tab === "yearly" && (
              <p className="mt-1 text-xs font-medium text-emerald-600">
                Save $
                {calculateYearlySavings(
                  pricing.monthly_price,
                  pricing.annual_price,
                )}{" "}
                yearly
              </p>
            )
          )}
        </div>

        {/* Features */}
        <div className="mb-8 space-y-3">
          {(tab === "monthly" ? benefits.monthly : benefits.annual).map(
            (benefit) => (
              <div key={benefit} className="flex gap-3 text-sm text-slate-600">
                <span className="mt-1 h-1.5 w-1.5 rounded bg-slate-900" />
                {benefit}
              </div>
            ),
          )}
        </div>

        {/* Forfeit Warning UI */}
        {showForfeitWarning && <ForfeitWarning targetPlan={"pro"} />}

        {/* CTA */}
        <Link
          href={`/gallery/billing/plans/checkout?plan_id=${plan_id}&interval=${tab}&id=${id}&action=${
            sub_data === null ? null : plan_change_params.action
          }&plan_action=${plan_action}`}
        >
          <button
            disabled={isDisabled}
            className={`w-full rounded py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 
              ${
                isFeatured
                  ? "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300"
              }
              disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {finalButtonText}
          </button>
        </Link>
      </div>
    </div>
  );
}
