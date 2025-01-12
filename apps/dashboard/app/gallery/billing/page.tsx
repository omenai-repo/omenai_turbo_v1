"use client";
import NoSubscriptionTheme from "./features/NoSubscriptionTheme";
import SubscriptionActiveTheme from "./features/SubscriptionActiveTheme";
import PageTitle from "../components/PageTitle";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";

export default function Subscription() {
  const router = useRouter();
  const url = auth_uri();
  const { session } = useContext(SessionContext);
  if (session === null || session === undefined) router.replace(url);

  const { data: isConfirmed, isLoading } = useQuery({
    queryKey: ["subscription_precheck"],
    queryFn: async () => {
      try {
        if (session === undefined) throw new Error("User not authenticated");

        // Fetch account ID first, as it's required for the next call
        const acc = await getAccountId(session.email);
        if (!acc?.isOk)
          throw new Error("Something went wrong, Please refresh the page");

        // Start retrieving subscription data while fetching Stripe onboarding status
        const [response, sub_check] = await Promise.all([
          checkIsStripeOnboarded(acc.data.connected_account_id), // Dependent on account ID
          retrieveSubscriptionData(session.gallery_id as string), // Independent
        ]);

        if (!response?.isOk || !sub_check?.isOk) {
          throw new Error("Something went wrong, Please refresh the page");
        }

        return {
          isSubmitted: response.details_submitted,
          id: acc.data.connected_account_id,
          isSubActive:
            sub_check?.data?.status === "active" ||
            sub_check?.data?.status === "canceled" ||
            sub_check?.data?.status === "expired",
          subscription_data: sub_check.data,
        };
      } catch (error) {
        console.error(error);
        handleError();
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[85vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <PageTitle title="Subscriptions & Billing" />

      {isConfirmed?.isSubActive ? (
        <SubscriptionActiveTheme
          subscription_data={isConfirmed.subscription_data}
        />
      ) : (
        <NoSubscriptionTheme />
      )}
    </div>
  );
}
