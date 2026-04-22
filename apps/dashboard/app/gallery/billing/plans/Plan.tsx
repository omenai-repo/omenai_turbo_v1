"use client";

import React from "react";
import Link from "next/link";
import { ObjectId } from "mongoose";
import { useSearchParams } from "next/navigation";
import { determinePlanChange } from "@omenai/shared-utils/src/determinePlanChange";
import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";

/* ----------------------------- CONFIG & HELPERS ----------------------------- */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  NGN: "₦",
};

// RESTORED: Yearly savings calculator
const calculateYearlySavings = (monthlyPrice: string, annualPrice: string) =>
  (Number(monthlyPrice) * 12 - Number(annualPrice)).toFixed(0);

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

const ForfeitWarning = ({ targetPlan }: { targetPlan: string }) => (
  <div className="mb-8 rounded-sm  bg-amber-50 border border-amber-200 p-3">
    <div className="flex gap-2">
      <span className="text-amber-600">⚠️</span>
      <p className="text-[11px] leading-relaxed font-medium text-amber-800">
        Selecting this plan will <span className="font-bold">forfeit</span> your
        one-time <span className="font-bold">1-month free trial</span> on the
        monthly <span className="capitalize font-bold">{targetPlan}</span> plan.
      </p>
    </div>
  </div>
);

/* ----------------------------- MAIN COMPONENT ----------------------------- */

interface PlanProps extends SubscriptionPlanDataTypes {
  tab: "monthly" | "yearly";
  id: ObjectId;
  sub_data: SubscriptionModelSchemaTypes;
  discount: boolean;
}

export default function Plan({
  name,
  pricing,
  benefits,
  tab,
  plan_id,
  id,
  sub_data,
  discount,
  currency = "USD",
}: PlanProps) {
  const searchParams = useSearchParams();
  const plan_action = searchParams.get("plan_action");

  // Routing and button logic
  const plan_change_params = getPlanChangeParams(sub_data, tab, pricing);
  const buttonText = getButtonText(sub_data, plan_action, name, tab);
  const isDisabled = isButtonDisabled(sub_data, name, tab, plan_action);

  // Link styling prop correctly
  const dark = name === "Gallery";

  // Discount logic
  const isEligibleForDiscount =
    discount && name.toLowerCase() === "gallery" && tab === "monthly";
  const showForfeitWarning = discount && !isEligibleForDiscount;
  const finalButtonText =
    isEligibleForDiscount && !isDisabled ? "Claim 1 month free" : buttonText;

  // Correct pricing parsing
  const basePrice = isEligibleForDiscount
    ? 0
    : tab === "monthly"
      ? Number(pricing.monthly_price)
      : Number(pricing.annual_price);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(basePrice);

  // Correct benefits parsing
  const benefitList = tab === "monthly" ? benefits.monthly : benefits.annual;

  return (
    <div
      className={`
        relative flex flex-col h-full px-8 py-10 lg:px-10 xl:px-14 xl:py-14
        transition-colors duration-200
        ${dark ? "bg-dark text-white" : "bg-white text-dark hover:bg-[#FAFAF8]"}
      `}
    >
      {/* ── Label row ── */}
      <div className="flex-none flex items-center justify-between mb-8">
        <span
          className={`text-[10px] tracking-[0.25em] uppercase ${
            dark ? "text-white/40" : "text-[#A8A09A]"
          }`}
        >
          {name}
        </span>

        {dark && (
          <span
            className={`text-[9px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-sm -full border ${
              dark
                ? "border-white/15 text-white/45"
                : "border-[#C8C2BB] text-[#A8A09A]"
            }`}
          >
            Popular
          </span>
        )}
      </div>

      {/* ── Thin rule ── */}
      <div
        className={`flex-none h-px mb-8 ${dark ? "bg-white/10" : "bg-[#EBE7E2]"}`}
      />

      {/* ── Price block ── */}
      <div className="flex-none mb-8">
        <div className="flex items-baseline leading-none gap-0.5">
          <span
            className={`text-[11px] tracking-wider mr-0.5 ${
              dark ? "text-white/40" : "text-[#B0A898]"
            }`}
          >
            {symbol}
          </span>
          <span
            className={`text-6xl xl:text-7xl font-extralight tracking-tight ${
              dark ? "text-white" : "text-dark"
            }`}
            style={{ lineHeight: 1 }}
          >
            {formattedPrice}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <p
            className={`text-xs tracking-wide ${
              dark ? "text-white/30" : "text-[#B8B0A8]"
            }`}
          >
            {isEligibleForDiscount
              ? "for 1 month"
              : `per ${tab === "monthly" ? "month" : "year"}`}
          </p>

          {(discount || isEligibleForDiscount) && (
            <span
              className={`text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm  ${
                dark
                  ? "bg-white/8 text-white/40"
                  : "bg-[#F0EDE8] text-[#9C8E7A]"
              }`}
            >
              {isEligibleForDiscount ? "One-time offer" : "Discount applied"}
            </span>
          )}

          {/* RESTORED: Yearly Savings Badge */}
          {!isEligibleForDiscount && tab === "yearly" && (
            <span
              className={`text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm  ${
                dark
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              Save {symbol}
              {calculateYearlySavings(
                pricing.monthly_price,
                pricing.annual_price,
              )}
            </span>
          )}
        </div>

        {/* RESTORED: Post-discount monthly price text */}
        {isEligibleForDiscount && (
          <p
            className={`mt-3 text-[10px] tracking-wider uppercase ${dark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            Then {symbol}
            {pricing.monthly_price}/mo
          </p>
        )}
      </div>

      {/* ── Thin rule ── */}
      <div
        className={`flex-none h-px mb-8 ${dark ? "bg-white/10" : "bg-[#EBE7E2]"}`}
      />

      {/* ── Benefits list ── */}
      <div className="flex-1 space-y-[18px] mb-8">
        {benefitList.map((benefit, i) => (
          <div key={i} className="flex items-start gap-3.5">
            <span
              className={`flex-none mt-[5px] w-1 h-1 rounded-sm -full ${
                dark ? "bg-white/30" : "bg-[#C0B8B0]"
              }`}
            />
            <span
              className={`text-[13px] leading-relaxed ${
                dark ? "text-white/55" : "text-[#6E6760]"
              }`}
            >
              {benefit}
            </span>
          </div>
        ))}
      </div>

      {/* Forfeit Warning UI */}
      {showForfeitWarning && <ForfeitWarning targetPlan={"gallery"} />}

      {/* ── CTA ── */}
      <div className="flex-none mt-auto">
        <Link
          href={`/gallery/billing/plans/checkout?plan_id=${plan_id}&interval=${tab}&id=${id}&action=${
            sub_data === null ? null : plan_change_params.action
          }&plan_action=${plan_action}`}
          className={isDisabled ? "pointer-events-none" : ""}
        >
          <button
            type="button"
            disabled={isDisabled}
            className={`
              w-full py-4 text-[11px] tracking-[0.2em] uppercase
              transition-all duration-200 active:scale-[0.98]
              ${
                isDisabled
                  ? dark
                    ? "bg-white/6 text-white/25 cursor-not-allowed"
                    : "bg-dark/5 text-dark/20 cursor-not-allowed border border-dark/8"
                  : dark
                    ? "bg-white text-dark hover:bg-white/90"
                    : "border border-dark text-dark hover:bg-dark hover:text-white"
              }
            `}
          >
            {finalButtonText}
          </button>
        </Link>
      </div>
    </div>
  );
}
