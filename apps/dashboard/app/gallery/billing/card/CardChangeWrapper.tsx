"use client";
import { notFound, useSearchParams } from "next/navigation";
import PageTitle from "../../components/PageTitle";
import CardChangeCheckoutItem from "../plans/checkout/components/CardChangeCheckoutItem";
import { useQuery } from "@tanstack/react-query";
import { getSinglePlanData } from "@omenai/shared-services/subscriptions/getSinglePlanData";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
export default function CardChangeWrapper() {
  const searchParams = useSearchParams();
  const plan_id = searchParams.get("plan_id");

  if (!plan_id) notFound();

  const { data, isLoading } = useQuery({
    queryKey: ["get_plan_details_for_card_change"],
    queryFn: async () => {
      const plan = await getSinglePlanData(plan_id);

      if (!plan?.isOk) throw new Error("Something went wrong");
      else return { plan: plan.data };
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="h-[75vh] w-full grid place-items-center">
        <Load />
      </div>
    );

  return (
    <div>
      <PageTitle title="Change card" />

      <>
        <div className="my-8 space-y-1">
          {/* <p className="text-[#858585] text-fluid-xs">
              Please fill in all information below to fully activate your
              subscription
            </p> */}
        </div>
        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3 items-baseline">
          <div className="col-span-1">
            <CardChangeCheckoutItem />
          </div>

          <div className="col-span-2" />
        </div>
      </>
    </div>
  );
}
