"use client";

import PageTitle from "../../components/PageTitle";
import { useQuery } from "@tanstack/react-query";
import { getAllPlanData } from "@omenai/shared-services/subscriptions/getAllPlanData";
import PlanWrapper from "./PlanWrapper";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import SubscriptionBillingBlocker from "@omenai/shared-ui-components/components/blockers/payments/SubscriptionDowntimeBlocker";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import { retrieveSubscriptionDiscount } from "@omenai/shared-services/subscriptions/retriveSubscriptionDiscount";

export default function Plans() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const { value: isSubscriptionBillingEnabled } = useHighRiskFeatureFlag(
    "subscription_creation_enabled",
  );

  const query = useQuery({
    queryKey: ["get_all_plan_details"],
    enabled: isSubscriptionBillingEnabled,
    queryFn: async () => {
      try {
        const [plans, subData, discountData] = await Promise.all([
          getAllPlanData(),
          retrieveSubscriptionData(user.gallery_id, csrf || ""),
          retrieveSubscriptionDiscount(user.email as string, csrf || ""),
        ]);

        return {
          plans: plans.data,
          sub: subData.data,
          discount: discountData.discount,
        };
      } catch (error: any) {
        throw new Error(
          "Something went wrong please try again or contact support for assistance",
        );
      }
    },
    refetchOnWindowFocus: false,
  });

  // Early return AFTER all hooks (original ordering preserved)
  if (!isSubscriptionBillingEnabled) {
    return <SubscriptionBillingBlocker />;
  }
  // ── END ORIGINAL LOGIC ──────────────────────────────────────────

  const { data, isLoading } = query;

  return (
    <div className="min-h-screen w-full flex flex-col">
      <PageTitle title="Pricing plans" />

      {isLoading ? (
        <div className="flex-1 w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <div className="flex flex-col flex-1 w-full">
          {/* ── Page header ──────────────────────────────────────── */}
          <div className="px-4 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#A8A09A] mb-2">
                Subscription
              </p>
              {/* Original text: "Choose your plan" / "Our pricing plans" */}
              <h1 className="text-3xl sm:text-4xl font-normal text-dark leading-snug">
                Choose your plan
              </h1>
            </div>
          </div>

          {/* ── Plan wrapper ─────────────────────────────────────── */}
          <PlanWrapper
            plans={data?.plans}
            sub_data={data?.sub}
            discount={data?.discount}
          />
        </div>
      )}
    </div>
  );
}
