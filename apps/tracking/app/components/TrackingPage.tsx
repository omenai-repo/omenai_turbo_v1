"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { getTrackingData } from "@omenai/shared-services/orders/getTrackingData"; // Ensure this calls your new /api/tracking endpoint

// Components
import TrackingSearch from "./TrackingSearch";
import ShipmentDetails from "./ShipmentDetails";
import TrackingMap from "./TrackingMap";
import TrackingTimeline from "./TrackingTimeline";
import TrackingNotFound from "./TrackingNotFound";
import TrackingLoading from "./TrackingLoading";

export default function TrackingPage() {
  const [searchedNumber, setSearchedNumber] = useState<string>("");
  const searchParams = useSearchParams();
  const queryId = searchParams.get("tracking_id");

  useEffect(() => {
    if (queryId) setSearchedNumber(queryId);
  }, [queryId]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tracking", searchedNumber],
    queryFn: async () => {
      const res = await getTrackingData(searchedNumber);
      if (!res.isOk)
        throw new Error(res.message || "Failed to fetch tracking data");
      return res.data; // Expecting UnifiedTrackingResponse
    },
    enabled: !!searchedNumber,
    retry: 1,
  });

  const handleSearch = (val: string) => setSearchedNumber(val);

  // Helper to format the "Last Updated" date from the latest event
  const latestEvent = data?.events?.[0];
  const lastUpdateDate = latestEvent
    ? new Date(latestEvent.timestamp).toLocaleDateString()
    : "N/A";
  const lastUpdateTime = latestEvent
    ? new Date(latestEvent.timestamp).toLocaleTimeString()
    : "";

  if (isError && !isLoading) {
    return (
      <TrackingNotFound
        trackingNumber={searchedNumber}
        onSearchAgain={() => setSearchedNumber("")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <IndividualLogo />
        </div>
      </nav>

      <main className="pb-20">
        <TrackingSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          initialTrackingNumber={searchedNumber}
        />

        {isLoading && <TrackingLoading />}

        {data && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <ShipmentDetails
              trackingId={data.tracking_number}
              service={data.carrier}
              status={data.current_status}
              date={lastUpdateDate}
              time={lastUpdateTime}
            />

            {/* Only show map if we have coordinates (Optional) */}
            {data.coordinates && (
              <TrackingMap
                origin={data.shipping_details?.addresses?.origin}
                destination={data.shipping_details?.addresses?.destination}
                estimatedDelivery={data.estimated_delivery}
                coordinates={data.coordinates}
              />
            )}

            <TrackingTimeline
              events={data.events}
              currentStatus={data.current_status}
              carrier={data.carrier}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">
            Powered by {data?.carrier === "UPS" ? "UPS" : "DHL Express"} • ©{" "}
            {new Date().getFullYear()} Omenai
          </p>
        </div>
      </footer>
    </div>
  );
}
