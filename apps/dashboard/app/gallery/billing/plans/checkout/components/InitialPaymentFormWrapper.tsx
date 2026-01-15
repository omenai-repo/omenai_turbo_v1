import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createSubscriptionPaymentIntent } from "@omenai/shared-services/subscriptions/stripe/createSubscriptionPaymentIntent";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";
import { PaymentForm } from "./InitialPaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { SubscriptionMetaData, WaitListTypes } from "@omenai/shared-types";
import { createPaymentMethodSetupIntent } from "@omenai/shared-services/subscriptions/stripe/createPaymentMethodSetupIntent";
interface SubscriptionFormProps {
  planId: string;
  amount: number;
  interval: string;
  discountEligible: boolean;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

export default function InitialPaymentFormWrapper({
  planId,
  amount,
  interval,
  discountEligible,
}: SubscriptionFormProps) {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const { data: paymentIntentData, isLoading: paymentIntentLoading } = useQuery(
    {
      queryKey: ["create_intent", planId],
      queryFn: async () => {
        const payload = {
          amount,
          gallery_id: user.gallery_id,
          meta: {
            name: user.name,
            email: user.email,
            gallery_id: user.gallery_id,
            plan_id: planId,
            plan_interval: interval,
          },
          token: csrf || "",
          email: user.email,
        };
        const response = await handleApiCall(discountEligible, payload);

        if (!response.isOk) {
          throw new Error(
            response.message || "Failed to create payment intent"
          );
        }

        return response.client_secret;
      },
      refetchOnWindowFocus: false,
    }
  );

  if (paymentIntentLoading)
    return (
      <div>
        <Load />
      </div>
    );

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: paymentIntentData }}
    >
      <PaymentForm
        isDiscounted={discountEligible}
        amount={amount || 0}
        planId={planId}
      />
    </Elements>
  );
}
async function handleApiCall(
  isDiscounted: boolean,
  payload: {
    gallery_id: string;
    token: string;
    email: string;
    amount: number;
    meta: SubscriptionMetaData;
  }
): Promise<{ isOk: boolean; message: string; client_secret?: string }> {
  if (isDiscounted) {
    return await createPaymentMethodSetupIntent(
      payload.gallery_id,
      payload.email,
      payload.token
    );
  } else {
    return await createSubscriptionPaymentIntent(
      payload.amount,
      payload.gallery_id,
      payload.meta,
      payload.token
    );
  }
}
