"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NoSubscriptionBlock from "../../components/NoSubscriptionBlock";
import NoVerificationBlock from "../../components/NoVerificationBlock";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { getAccountId } from "@omenai/shared-services/stripe/getAccountId";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";
import { CreateGalleryEventForm } from "../components/CreateGalleryEventForm";
import SubscriptionUpgradeBlocker from "../../components/SubscriptionUpgradeBlock";

export default function CreatePageWrapper() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const rollbar = useRollbar();
  const router = useRouter();

  const porEligible = ["gallery", "principal"];
  const eventEligible = ["principal"];

  const {
    data: isConfirmed,
    isPending,
    isLoading,
  } = useQuery({
    queryKey: ["upload_precheck", user?.gallery_id, csrf],
    queryFn: async () => {
      try {
        const acc = await getAccountId(user.gallery_id as string, csrf || "");
        if (!acc?.isOk)
          throw new Error("Something went wrong, Please refresh the page");

        const [response, sub_check] = await Promise.all([
          checkIsStripeOnboarded(acc.data.connected_account_id, csrf || ""),
          retrieveSubscriptionData(user.gallery_id as string, csrf || ""),
        ]);

        if (!response?.isOk || !sub_check?.isOk) {
          throw new Error("Something went wrong, Please refresh the page");
        }

        return {
          isSubmitted: response.details_submitted,
          id: acc.data.connected_account_id,
          isSubActive: sub_check?.data?.status === "active",
          isPremium: porEligible.includes(
            sub_check?.data?.plan_details?.type?.toLowerCase(),
          ),
          isEventEligible: eventEligible.includes(
            sub_check?.data?.plan_details?.type?.toLowerCase(),
          ),
        };
      } catch (error) {
        if (error instanceof Error) {
          rollbar.error(error);
        } else {
          rollbar.error(new Error(String(error)));
        }
        console.error(error);
        handleError();
        return null; // Ensure we return null on error so the UI knows it failed
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!user?.gallery_id && !!csrf, // Ensure it only runs when we have auth data
  });

  // Handle Stripe Redirection safely using useEffect
  useEffect(() => {
    if (isConfirmed && !isConfirmed.isSubmitted) {
      router.replace(`/gallery/payouts/refresh?id=${isConfirmed.id}`);
    }
  }, [isConfirmed, router]);

  // 1. Loading State
  if (isPending || isLoading || isConfirmed === undefined) {
    return (
      <div className="grid h-[78vh] w-full place-items-center">
        <Load />
      </div>
    );
  }

  // 2. Wait for redirect to finish if Stripe is not onboarded
  if (isConfirmed !== null && !isConfirmed.isSubmitted) {
    return (
      <div className="grid h-[78vh] w-full place-items-center">
        <Load />
      </div>
    );
  }

  // Wrapper for early returns
  const renderContent = () => {
    // 3. Not Verified Blocker (Highest Priority)
    if (!user?.gallery_verified) {
      return <NoVerificationBlock gallery_name={user?.name as string} />;
    }

    // 4. No Active Subscription Blocker
    if (!isConfirmed?.isSubActive) {
      return <NoSubscriptionBlock />;
    }

    // 5. Active Sub, but NOT eligible for Events Blocker
    if (!isConfirmed?.isEventEligible) {
      return <SubscriptionUpgradeBlocker />;
    }

    // 6. Passed all checks - Show the Form
    return <CreateGalleryEventForm />;
  };

  return <div className="relative">{renderContent()}</div>;
}
