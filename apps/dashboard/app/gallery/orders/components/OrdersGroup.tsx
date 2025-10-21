"use client";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getOverviewOrders } from "@omenai/shared-services/orders/getOverviewOrders";
import { OrdersTab } from "./OrdersTab";
import { OrderSkeleton } from "@omenai/shared-ui-components/components/skeletons/OrdersSkeleton";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import { useRouter } from "next/navigation";
import UploadArtworkDetails from "../../artworks/upload/features/UploadArtworkDetails";
import NoSubscriptionBlock from "../../components/NoSubscriptionBlock";
import NoVerificationBlock from "../../components/NoVerificationBlock";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import Load from "@omenai/shared-ui-components/components/loader/Load";
export default function OrdersGroup() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const [tab, setTab] = useState("pending");
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["fetch_orders_by_category"],
    queryFn: async () => {
      try {
        // Fetch account ID first, as it's required for the next call
        const acc = await getAccountId(user.email as string, csrf || "");

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

        const result = await getOverviewOrders(user.gallery_id);

        return {
          isSubmitted: response.details_submitted,
          id: acc.data.connected_account_id,
          isSubActive: sub_check?.data?.status === "active",
          orders: !result ? [] : result.isOk ? result.data : [],
          subExpiryDate: sub_check?.data?.expiry_date || null,
        };
      } catch (error) {
        handleError();
      }
    },
    refetchOnWindowFocus: false,
  });
  function isSubscriptionExpired(subscriptionDateStr: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); //normalize to midnight

    const subscriptionDate = new Date(subscriptionDateStr);
    subscriptionDate.setHours(0, 0, 0, 0); //normalize to midnight

    return subscriptionDate < today;
  }
  if (isLoading) {
    return <OrderSkeleton />;
  }
  if (!data?.isSubmitted)
    router.replace(`/gallery/payouts/refresh?id=${data!.id}`);

  return (
    <>
      <div className="w-full mt-4">
        {!user.gallery_verified && !data?.isSubActive && (
          <NoVerificationBlock gallery_name={user.name as string} />
        )}
        {(user.gallery_verified as boolean) &&
          !data?.isSubActive &&
          isSubscriptionExpired(data?.subExpiryDate) && <NoSubscriptionBlock />}
        {!user.gallery_verified && data?.isSubActive && (
          <NoVerificationBlock gallery_name={user.name as string} />
        )}
        {(user.gallery_verified as boolean) && data?.isSubActive && (
          <OrdersTab orders={data?.orders} />
        )}
      </div>
    </>
  );
}
