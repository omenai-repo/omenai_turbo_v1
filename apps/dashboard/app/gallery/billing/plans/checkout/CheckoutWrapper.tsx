"use client";
import PageTitle from "../../../components/PageTitle";
import CheckoutItem from "./components/CheckoutItem";
import { getSinglePlanData } from "@omenai/shared-services/subscriptions/getSinglePlanData";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import CardChangeCheckoutItem from "./components/CardChangeCheckoutItem";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { PaymentForm } from "./components/InitialPaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import InitialPaymentFormWrapper from "./components/InitialPaymentFormWrapper";
import MigrationUpgradeCheckoutItem from "./components/MigrationUpgradeCheckoutItem";
import MigrationUpgradeCheckout from "./components/MigrationUpgradeCheckout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

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
      if (!plans?.isOk) throw new Error("Something went wrong");
      else return { plans: plans.data };
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
                {/* Render card change payment form */}
                <InitialPaymentFormWrapper
                  planId={plan_id || ""}
                  interval={interval}
                  amount={
                    interval === "monthly"
                      ? +data?.plans.pricing.monthly_price
                      : data?.plans.pricing.yearly_price || 0
                  }
                />
              </div>
            ) : (
              <div className="col-span-1">
                <MigrationUpgradeCheckout
                  plan={data?.plans}
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
