"use client";
import Link from "next/link";
import { ObjectId } from "mongoose";
import { determinePlanChange } from "@omenai/shared-utils/src/determinePlanChange";
import { useSearchParams } from "next/navigation";
import {
  SubscriptionPlanDataTypes,
  SubscriptionModelSchemaTypes,
} from "@omenai/shared-types";
interface PlanChangeResult {
  action: "upgrade" | "downgrade";
  shouldCharge: boolean;
}
export default function Plan({
  name,
  pricing,
  benefits,
  tab,
  plan_id,
  id,
  sub_data,
}: SubscriptionPlanDataTypes & {
  tab: "monthly" | "yearly";
  id: ObjectId;
  sub_data: SubscriptionModelSchemaTypes & {
    created: string;
    updatedAt: string;
  };
}) {
  const searchParams = useSearchParams();

  const plan_action = searchParams.get("plan_action");
  let plan_change_params: { action: string; shouldCharge: boolean } = {
    action: "",
    shouldCharge: false,
  };

  if (sub_data !== null) {
    const { action, shouldCharge } = determinePlanChange(
      sub_data.plan_details.type.toLowerCase(),
      sub_data.plan_details.interval.toLowerCase() as "yearly" | "monthly",
      tab === "yearly" ? +pricing.annual_price : +pricing.monthly_price,
      tab,
      sub_data.status
    );
    plan_change_params = { action, shouldCharge };
  }

  let buttonText = "Get started today";

  if (sub_data !== null) {
    buttonText =
      sub_data.status === "expired"
        ? "Get started today"
        : plan_action === "reactivation"
          ? "Activate plan"
          : sub_data.plan_details.type !== name ||
              (sub_data.plan_details.type === name &&
                sub_data.plan_details.interval !== tab)
            ? "Migrate"
            : "Subscribed";
  }

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto my-12">
        {/* Design 1: Premium Card with Badge */}
        <div className="relative">
          {/* Popular Badge */}
          {name === "Pro" && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-lg">
                Most Popular
              </span>
            </div>
          )}

          <div
            className={`bg-white rounded shadow-lg overflow-hidden ${
              name === "Pro"
                ? "ring-2 ring-blue-600"
                : "border border-slate-200"
            }`}
          >
            {/* Header Section */}
            <div className="p-8 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {name === "Basic" && "Essential features to get started"}
                    {name === "Pro" && "Perfect for growing businesses"}
                    {name === "Premium" && "Advanced features for scale"}
                  </p>
                </div>
                {name === "Premium" && (
                  <div className="p-2 bg-purple-100 rounded">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="mt-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900">
                    $
                    {tab === "monthly"
                      ? pricing.monthly_price
                      : pricing.annual_price}
                  </span>
                  <span className="ml-2 text-lg text-slate-500">
                    /{tab === "monthly" ? "month" : "year"}
                  </span>
                </div>
                {tab === "yearly" && (
                  <p className="mt-1 text-sm text-green-600 font-medium">
                    Save $
                    {(
                      Number(pricing.monthly_price) * 12 -
                      Number(pricing.annual_price)
                    ).toFixed(0)}{" "}
                    per year
                  </p>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div className="px-8 pb-8">
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">
                  What's included
                </h4>
                <ul className="space-y-3">
                  {tab === "monthly"
                    ? benefits.monthly.map((benefit) => {
                        return (
                          <li key={benefit} className="flex items-start">
                            <span className="flex-shrink-0">
                              <svg
                                className="h-4 w-4 text-dark"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                ></path>
                              </svg>
                            </span>
                            <p className="ml-3 text-fluid-xxs leading-6 text-[#858585]">
                              {benefit}
                            </p>
                          </li>
                        );
                      })
                    : benefits.annual.map((benefit) => {
                        return (
                          <li key={benefit} className="flex items-start">
                            <span className="flex-shrink-0">
                              <svg
                                className="h-4 w-4 text-dark"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                ></path>
                              </svg>
                            </span>
                            <p className="ml-3 text-fluid-xxs leading-6 text-[#858585]">
                              {benefit}
                            </p>
                          </li>
                        );
                      })}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <Link
                  href={`/gallery/billing/plans/checkout?plan_id=${plan_id}&interval=${tab}&id=${id}&action=${
                    sub_data === null ? null : plan_change_params.action
                  }&plan_action=${plan_action}`}
                >
                  <button
                    disabled={
                      sub_data !== null &&
                      sub_data.status === "active" &&
                      sub_data.plan_details.type === name &&
                      sub_data.plan_details.interval === tab &&
                      plan_action === null
                    }
                    className={`w-full py-3 px-6 rounded font-medium text-sm transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      name === "Pro"
                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600"
                        : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900"
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {buttonText}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
