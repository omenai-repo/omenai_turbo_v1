"use client";

import { useQuery } from "@tanstack/react-query";
import NoSubscriptionBlock from "../../components/NoSubscriptionBlock";
import NoVerificationBlock from "../../components/NoVerificationBlock";
import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function UploadArtwork() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const url = auth_uri();
  const router = useRouter();

  const { data: isConfirmed, isLoading } = useQuery({
    queryKey: ["upload_precheck"],
    queryFn: async () => {
      try {
        // Fetch account ID first, as it's required for the next call
        const acc = await getAccountId(user.email as string, csrf || "");
        if (!acc?.isOk)
          throw new Error("Something went wrong, Please refresh the page");

        // Start retrieving subscription data while fetching Stripe onboarding status
        const [response, sub_check] = await Promise.all([
          checkIsStripeOnboarded(acc.data.connected_account_id, csrf || ""), // Dependent on account ID
          retrieveSubscriptionData(user.gallery_id as string), // Independent
        ]);

        if (!response?.isOk || !sub_check?.isOk) {
          throw new Error("Something went wrong, Please refresh the page");
        }

        return {
          isSubmitted: response.details_submitted,
          id: acc.data.connected_account_id,
          isSubActive: sub_check?.data?.status === "active",
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
      <div className="h-[78vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  if (!isConfirmed!.isSubmitted)
    router.replace(`/gallery/payouts/refresh?id=${isConfirmed!.id}`);

  return (
    <div className="relative">
      <PageTitle title="Upload an artwork" />
      {!user.gallery_verified && !isConfirmed?.isSubActive && (
        <NoVerificationBlock gallery_name={user.name as string} />
      )}
      {(user.gallery_verified as boolean) && !isConfirmed?.isSubActive && (
        <NoSubscriptionBlock />
      )}
      {!user.gallery_verified && isConfirmed?.isSubActive && (
        <NoVerificationBlock gallery_name={user.name as string} />
      )}
      {(user.gallery_verified as boolean) && isConfirmed?.isSubActive && (
        <div className="">
          <UploadArtworkDetails />
        </div>
      )}
    </div>
  );
}
