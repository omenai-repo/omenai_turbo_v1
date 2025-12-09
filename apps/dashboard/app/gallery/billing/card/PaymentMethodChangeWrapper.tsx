"use client";
import PageTitle from "../../components/PageTitle";
import CardChangeCheckoutItem from "../plans/checkout/components/CardChangeCheckoutItem";
import { useQuery } from "@tanstack/react-query";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createPaymentMethodSetupIntent } from "@omenai/shared-services/subscriptions/stripe/createPaymentMethodSetupIntent";
import { PaymentMethodChangeForm } from "./CardChangePaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function PaymentMethofChangeWrapper() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const { data: client, isLoading } = useQuery({
    queryKey: ["create_payment_method_setup_intent"],
    queryFn: async () => {
      const intent = await createPaymentMethodSetupIntent(
        user.gallery_id,
        user.email,
        csrf || ""
      );

      if (!intent?.isOk)
        throw new Error("Something went wrong, please contact support");
      else return { client_secret: intent.client_secret };
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="h-[50vh] w-full grid place-items-center">
        <Load />
      </div>
    );

  return (
    <div>
      <PageTitle title="Change card" />

      <>
        <div className="max-w-xl mx-auto gap-3 my-4 items-baseline">
          <div className="col-span-1 space-y-4">
            <CardChangeCheckoutItem />
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: client?.client_secret }}
            >
              <PaymentMethodChangeForm />
            </Elements>
          </div>

          <div className="col-span-2" />
        </div>
      </>
    </div>
  );
}
