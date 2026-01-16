"use client";
import NoSubscriptionTheme from "./features/NoSubscriptionTheme";
import SubscriptionActiveTheme from "./features/SubscriptionActiveTheme";
import { useQuery } from "@tanstack/react-query";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import BillingSkeleton from "@omenai/shared-ui-components/components/skeletons/BillingSkeleton";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";

export default function SubscriptionBase() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const rollbar = useRollbar();

  const { data: isConfirmed, isLoading } = useQuery({
    queryKey: ["subscription_precheck"],
    queryFn: async () => {
      try {
        // Fetch account ID first, as it's required for the next call
        const acc = await getAccountId(user.gallery_id, csrf || "");
        if (!acc?.isOk)
          throw new Error("Something went wrong, Please refresh the page");

        // Start retrieving subscription data while fetching Stripe onboarding status
        const [response, sub_check] = await Promise.all([
          checkIsStripeOnboarded(acc.data.connected_account_id, csrf || ""), // Dependent on account ID
          retrieveSubscriptionData(user.gallery_id as string, csrf || ""), // Independent
        ]);

        if (!response?.isOk || !sub_check?.isOk) {
          throw new Error("Something went wrong, Please refresh the page");
        }

        return {
          isSubmitted: response.details_submitted,
          id: acc.data.connected_account_id,
          isSubActive: sub_check?.data?.subscription_id ? true : false,
          subscription_data: sub_check.data,
          subscription_plan: sub_check.plan,
        };
      } catch (error) {
        if (error instanceof Error) {
          rollbar.error(error);
        } else {
          rollbar.error(new Error(String(error)));
        }
        console.error(error);
        handleError();
      }
    },
    refetchOnWindowFocus: true,
  });
  return (
    <>
      {isLoading ? (
        <div className="mt-6">
          <BillingSkeleton />
        </div>
      ) : isConfirmed?.isSubActive ? (
        <SubscriptionActiveTheme
          subscription_plan={isConfirmed.subscription_plan}
          subscription_data={isConfirmed.subscription_data}
        />
      ) : (
        <NoSubscriptionTheme />
      )}
    </>
  );
}
