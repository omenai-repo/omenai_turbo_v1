"use client";
import TrackingPage from "./components/TrackingPage";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import ShippingDowntimeBlocker from "@omenai/shared-ui-components/components/blockers/tracking/TrackingDowntimeBlocker";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
export default function TrackingPageWrapper() {
  const searchParams = useSearchParams();
  const tracking_id = searchParams.get("tracking_id") || "";

  const { value: isTrackingEnabled } = useLowRiskFeatureFlag(
    "shipment_tracking_enabled"
  );

  if (!isTrackingEnabled)
    return (
      <Suspense>
        <ShippingDowntimeBlocker trackingNumber={tracking_id} />;
      </Suspense>
    );
  return (
    <Suspense>
      <TrackingPage />
    </Suspense>
  );
}
