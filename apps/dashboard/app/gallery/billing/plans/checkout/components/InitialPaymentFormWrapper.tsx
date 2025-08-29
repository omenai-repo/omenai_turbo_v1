import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createSubscriptionPaymentIntent } from "@omenai/shared-services/subscriptions/stripe/createSubscriptionPaymentIntent";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { PaymentForm } from "./InitialPaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
interface SubscriptionFormProps {
  planId: string;
  amount: number;
  interval: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function InitialPaymentFormWrapper({
  planId,
  amount,
  interval,
}: SubscriptionFormProps) {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const { data: paymentIntentData, isLoading: paymentIntentLoading } = useQuery(
    {
      queryKey: ["create_payment_intent", planId],
      queryFn: async () => {
        const response = await createSubscriptionPaymentIntent(
          amount,
          user.gallery_id,
          {
            name: user.name,
            email: user.email,
            gallery_id: user.gallery_id,
            plan_id: planId,
            plan_interval: interval,
          },
          csrf || ""
        );

        if (!response.isOk) {
          throw new Error(
            response.message || "Failed to create payment intent"
          );
        }

        console.log(response.client_secret);
        return response.client_secret;
      },
    }
  );

  if (paymentIntentLoading) return <Load />;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: paymentIntentData }}
    >
      <PaymentForm planId={planId || ""} amount={amount || 0} />
    </Elements>
  );
}
