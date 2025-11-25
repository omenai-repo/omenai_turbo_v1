"use client";

import PageTitle from "../../components/PageTitle";
import { useQuery } from "@tanstack/react-query";
import { getAllPlanData } from "@omenai/shared-services/subscriptions/getAllPlanData";
import PlanWrapper from "./PlanWrapper";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { getApiUrl } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import SubscriptionBillingBlocker from "@omenai/shared-ui-components/components/blockers/payments/SubscriptionDowntimeBlocker";

export default function Plans() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const url = getApiUrl();

  const { value: isSubscriptionBillingEnabled } = useHighRiskFeatureFlag(
    "subscription_creation_enabled"
  );

  const query = useQuery({
    queryKey: ["get_all_plan_details"],
    enabled: isSubscriptionBillingEnabled,
    queryFn: async () => {
      const plans = await getAllPlanData();
      const res = await fetch(`${url}/api/subscriptions/retrieveSubData`, {
        method: "POST",
        body: JSON.stringify({ gallery_id: user.gallery_id }),
        headers: { "x-csrf-token": csrf || "" },
        credentials: "include",
      });

      const result = await res.json();
      if (!plans?.isOk || !res?.ok) throw new Error("Something went wrong");
      else return { plans: plans.data, sub: result.data };
    },
    refetchOnWindowFocus: false,
  });

  // Early return happens AFTER all hooks
  if (!isSubscriptionBillingEnabled) {
    return <SubscriptionBillingBlocker />;
  }

  const { data, isLoading } = query;

  return (
    <div>
      <PageTitle title="Pricing plans" />
      {isLoading ? (
        <div className="h-[75vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <>
          <div className="mt-10 text-center">
            <p className="text-fluid-base leading-4 text-[#858585] ">
              Choose your plan
            </p>
            <h1 className="text-fluid-xl font-bold leading-10 mt-3 text-dark">
              Our pricing plans
            </h1>
          </div>
          <PlanWrapper plans={data?.plans} sub_data={data?.sub} />
        </>
      )}
    </div>
  );
}
