"use client";
import React, { useContext } from "react";

import { notFound, useSearchParams, useRouter } from "next/navigation";

import PageTitle from "../../components/PageTitle";
import CardChangeCheckoutItem from "../plans/checkout/components/CardChangeCheckoutItem";
import { CheckoutStepper } from "../plans/checkout/components/CheckoutStepper";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";

export default function SubscriptionCheckout() {
  const searchParams = useSearchParams();
  const url = auth_uri();

  const charge_type = searchParams.get("charge_type");
  const router = useRouter();
  const { session } = useContext(SessionContext);

  if (session === undefined || session === null) router.replace(url);

  if (charge_type === null || charge_type === undefined) return notFound();

  return (
    <div>
      <PageTitle title="Change card" />

      {false ? (
        <div className="h-[75vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
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
      )}
    </div>
  );
}
