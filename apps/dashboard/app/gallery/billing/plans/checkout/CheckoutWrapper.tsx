"use client";
import React, { useContext } from "react";
import PageTitle from "../../../components/PageTitle";
import { CheckoutStepper } from "./components/CheckoutStepper";
import CheckoutItem from "./components/CheckoutItem";
import { getSinglePlanData } from "@omenai/shared-services/subscriptions/getSinglePlanData";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams, useRouter } from "next/navigation";

import MigrationUpgradeCheckoutItem from "./components/MigrationUpgradeCheckoutItem";
import CardChangeCheckoutItem from "./components/CardChangeCheckoutItem";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function SubscriptionCheckout() {
  const searchParams = useSearchParams();
  const plan_id = searchParams.get("plan_id");
  const interval = searchParams.get("interval");
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const charge_type = searchParams.get("charge_type");
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  if (
    plan_id === null ||
    plan_id === undefined ||
    interval === null ||
    interval === undefined ||
    id === null ||
    id === undefined
  )
    notFound();

  const { data, isLoading } = useQuery({
    queryKey: ["get_plan_and_sub_details"],
    queryFn: async () => {
      const plans = await getSinglePlanData(plan_id);
      const sub_data = await retrieveSubscriptionData(
        user.gallery_id,
        csrf || ""
      );

      if (!plans?.isOk || !sub_data?.isOk)
        throw new Error("Something went wrong");
      else return { plans: plans.data, sub_data: sub_data.data };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <PageTitle title="Checkout" />

      {isLoading ? (
        <div className="h-[75vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-3 items-baseline">
            {action === "null" ? (
              <div className="col-span-1">
                {charge_type === "card_change" ? (
                  <CardChangeCheckoutItem />
                ) : (
                  <CheckoutItem plan={data?.plans} interval={interval} />
                )}
                <CheckoutStepper plan={data?.plans} />
              </div>
            ) : (
              <div className="col-span-1">
                <MigrationUpgradeCheckoutItem
                  plan={data?.plans}
                  interval={interval as "yearly" | "monthly"}
                  sub_data={data?.sub_data}
                />
              </div>
            )}
            <div className="col-span-2" />
          </div>
        </>
      )}
    </div>
  );
}
