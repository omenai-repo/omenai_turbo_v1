"use client";
import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import SubscriptionBillingBlocker from "@omenai/shared-ui-components/components/blockers/payments/SubscriptionDowntimeBlocker";
import PaymentMethodChangeWrapper from "./PaymentMethodChangeWrapper";
export const dynamic = "force-dynamic";

export default function PaymentMethodWrapper() {
  const { value: isSubscriptionBillingEnabled } = useHighRiskFeatureFlag(
    "subscription_creation_enabled"
  );

  if (!isSubscriptionBillingEnabled) return <SubscriptionBillingBlocker />;
  return <PaymentMethodChangeWrapper />;
}
