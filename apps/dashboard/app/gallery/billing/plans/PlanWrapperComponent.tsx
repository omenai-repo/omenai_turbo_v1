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
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import { retrieveSubscriptionDiscount } from "@omenai/shared-services/subscriptions/retriveSubscriptionDiscount";

export default function Plans() {
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const { value: isSubscriptionBillingEnabled } = useHighRiskFeatureFlag(
    "subscription_creation_enabled"
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
          "Something went wrong please try again or contact support for assistance"
        );
      }
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
          <div className=" text-center">
            <p className="text-fluid-base leading-4 text-[#858585] ">
              Choose your plan
            </p>
            <h1 className="text-fluid-xl font-bold leading-10 mt-3 text-dark">
              Our pricing plans
            </h1>
          </div>
          <PlanWrapper
            plans={data?.plans}
            sub_data={data?.sub}
            discount={data?.discount}
          />
        </>
      )}
    </div>
  );
}
