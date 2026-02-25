"use client";
import TrackingPage from "./components/TrackingPage";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import ShippingDowntimeBlocker from "@omenai/shared-ui-components/components/blockers/tracking/TrackingDowntimeBlocker";
import { useSearchParams } from "next/navigation";
export default function TrackingPageWrapper() {
  const searchParams = useSearchParams();
  const tracking_id = searchParams.get("tracking_id") || "";
  const courierTrackingId =
    searchParams.get("courier_tracking_id") || tracking_id;
  const courier = searchParams.get("courier") || "DHL";

  const { value: isTrackingEnabled } = useLowRiskFeatureFlag(
    "shipment_tracking_enabled",
  );

  if (isTrackingEnabled)
    return (
      <ShippingDowntimeBlocker
        trackingNumber={courierTrackingId}
        carrier={courier}
      />
    );
  return <TrackingPage />;
}
