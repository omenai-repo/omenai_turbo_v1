"use client";
import PageTitle from "../../../components/PageTitle";
import CheckoutItem from "./components/CheckoutItem";
import { getSinglePlanData } from "@omenai/shared-services/subscriptions/getSinglePlanData";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import CardChangeCheckoutItem from "./components/CardChangeCheckoutItem";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { loadStripe } from "@stripe/stripe-js";
import InitialPaymentFormWrapper from "./components/InitialPaymentFormWrapper";
import MigrationUpgradeCheckout from "./components/MigrationUpgradeCheckout";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { retrieveSubscriptionDiscount } from "@omenai/shared-services/subscriptions/retriveSubscriptionDiscount";
import { SubscriptionPlanDataTypes, WaitListTypes } from "@omenai/shared-types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function SubscriptionCheckout() {
  const searchParams = useSearchParams();
  const plan_id = searchParams.get("plan_id");
  const interval = searchParams.get("interval");
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const charge_type = searchParams.get("charge_type");
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  if (!plan_id || !interval || !id || !["monthly", "yearly"].includes(interval))
    notFound();

  const { data, isLoading } = useQuery({
    queryKey: ["get_plan_details"],
    queryFn: async () => {
      const [plan, discount_data] = await Promise.all([
        getSinglePlanData(plan_id),
        retrieveSubscriptionDiscount(user.email as string, csrf || ""),
      ]);

      if (!plan?.isOk || !discount_data.isOk)
        throw new Error("Something went wrong");

      return {
        plan: plan.data as SubscriptionPlanDataTypes & {
          createdAt: string;
          updatedAt: string;
        },
        discount: discount_data.discount as WaitListTypes["discount"],
      };
    },
    refetchOnWindowFocus: false,
  });

  const isEligibleForDiscount =
    data?.discount !== null &&
    data?.discount.plan === data?.plan.name.toLowerCase() &&
    data?.discount.redeemed === false;

  return (
    <div>
      <PageTitle title="Checkout" />

      {isLoading ? (
        <div className="h-[50vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <>
          <div className="gap-3 mt-4">
            {action === "null" ? (
              <div className="space-y-5">
                <CheckoutItem
                  discountEligible={isEligibleForDiscount}
                  plan={
                    data?.plan as SubscriptionPlanDataTypes & {
                      createdAt: string;
                      updatedAt: string;
                    }
                  }
                  interval={interval as "monthly" | "yearly"}
                  planId={plan_id || ""}
                />
              </div>
            ) : (
              <div className="">
                <MigrationUpgradeCheckout
                  plan={
                    data?.plan as SubscriptionPlanDataTypes & {
                      createdAt: string;
                      updatedAt: string;
                      _id: string;
                    }
                  }
                  interval={interval as "yearly" | "monthly"}
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
