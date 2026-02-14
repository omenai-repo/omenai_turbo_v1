"use client";
import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import PageTitle from "../components/PageTitle";
import SubscriptionBase from "./SubscriptionBase";
export const dynamic = "force-dynamic";

import SubscriptionBillingBlocker from "@omenai/shared-ui-components/components/blockers/payments/SubscriptionDowntimeBlocker";
export default function Subscription() {
  const { value: isSubscriptionBillingEnabled } = useHighRiskFeatureFlag(
    "subscription_creation_enabled"
  );
  return (
    <>
      {!isSubscriptionBillingEnabled ? (
        <SubscriptionBillingBlocker />
      ) : (
        <div className="w-full h-full relative">
          <PageTitle title="Subscriptions & Billing" />
          <SubscriptionBase />
        </div>
      )}
    </>
  );
}
