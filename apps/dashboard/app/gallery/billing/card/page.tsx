"use client";

import PageTitle from "../../components/PageTitle";
import CardChangeCheckoutItem from "../plans/checkout/components/CardChangeCheckoutItem";
import { CheckoutStepper } from "../plans/checkout/components/CheckoutStepper";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function SubscriptionCheckout() {
  const { user } = useAuth({ requiredRole: "gallery" });

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

            <CheckoutStepper />
          </div>

          <div className="col-span-2" />
        </div>
      </>
    </div>
  );
}
