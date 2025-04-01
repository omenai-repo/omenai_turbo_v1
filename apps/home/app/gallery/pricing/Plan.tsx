"use client";
import Link from "next/link";
import { ObjectId } from "mongoose";

import { useSearchParams } from "next/navigation";
import { SubscriptionPlanDataTypes } from "@omenai/shared-types";

export default function Plan({
  name,
  pricing,
  benefits,
  tab,
  plan_id,
  id,
}: SubscriptionPlanDataTypes & {
  tab: "monthly" | "yearly";
  id: ObjectId;
}) {
  const searchParams = useSearchParams();

  const plan_action = searchParams.get("plan_action");
  let plan_change_params: { action: string; shouldCharge: boolean } = {
    action: "",
    shouldCharge: false,
  };

  // if (sub_data !== null) {
  //   const { action, shouldCharge } = determinePlanChange(
  //     sub_data.plan_details.type.toLowerCase(),
  //     sub_data.plan_details.interval.toLowerCase() as "yearly" | "monthly",
  //     tab === "yearly" ? +pricing.annual_price : +pricing.monthly_price,
  //     tab
  //   );
  //   plan_change_params = { action, shouldCharge };
  // }

  // let buttonText = "Get started today";

  // if (sub_data !== null) {
  //   if (
  //     sub_data.plan_details.type !== name ||
  //     (sub_data.plan_details.type === name &&
  //       sub_data.plan_details.interval !== tab)
  //   ) {
  //     buttonText =
  //       plan_action === "reactivation" ? "Activate plan" : "Subscribed";
  //   }
  // }

  return (
    <>
      <div className="relative z-10 w-fit my-12">
        <div className="mx-auto w-fit">
          <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-[#E0E0E0]">
            <div className="p-8">
              <h3
                className="text-sm font-semibold leading-4 tracking-tight text-gray-700"
                id="tier-hobby"
              >
                {name}
              </h3>
              <div className="mt-4 flex items-baseline text-xl font-bold tracking-tight text-gray-900">
                {tab === "monthly"
                  ? `$${pricing.monthly_price}`
                  : `$${pricing.annual_price}`}

                <span className="text-lg font-semibold leading-8 tracking-normal text-gray-500">
                  {tab === "monthly" ? `/mo` : `/yr`}
                </span>
              </div>
              <p className="mt-6 text-[14px] text-gray-600">
                {name === "Basic" && "All basic features included."}
                {name === "Pro" && "Best deal for you"}
                {name === "Premium" && "For those who expect more"}
              </p>
            </div>
            <div className="flex flex-1 flex-col p-2">
              <div className="flex flex-1 flex-col justify-between rounded-2xl bg-gray-50 p-4">
                <ul role="list" className="space-y-4">
                  {benefits.map((benefit) => {
                    return (
                      <li key={benefit} className="flex items-start">
                        <span className="flex-shrink-0">
                          <svg
                            className="h-4 w-4 text-gray-700"
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
                        <p className="ml-3 text-[14px] leading-6 text-[#858585]">
                          {benefit}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-8">
                  <Link href={"/auth/login"}>
                    <button className="h-[40px] px-4 w-full text-[14px] text-white disabled:cursor-not-allowed disabled:bg-dark/10 hover:bg-dark/80 bg-dark duration-300 grid place-items-center">
                      Get started
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
