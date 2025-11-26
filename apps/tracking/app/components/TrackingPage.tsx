// TrackingPage.tsx - Main tracking page component
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TrackingSearch from "./TrackingSearch";
import ShipmentDetails from "./ShipmentDetails";
import TrackingMap from "./TrackingMap";
import TrackingTimeline from "./TrackingTimeline";
import TrackingNotFound from "./TrackingNotFound";
import TrackingLoading from "./TrackingLoading";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { getTrackingData } from "@omenai/shared-services/orders/getTrackingData";
import { useSearchParams } from "next/navigation";

export default function TrackingPage() {
  const [, setTrackingNumber] = useState<string>("");
  const [searchedNumber, setSearchedNumber] = useState<string>("");

  const searchParams = useSearchParams();
  const tracking_id = searchParams.get("tracking_id") || "";

  // Fetch tracking data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tracking", searchedNumber],
    queryFn: async () => {
      const response = await getTrackingData(searchedNumber);

      if (!response?.isOk)
        throw new Error(
          response?.message ||
            "Tracking data currently unavailable. Please try again"
        );

      return {
        events: response.events,
        coordinates: response.coordinates,
        order_date: response.order_date,
        artwork_data: response.arwork_data,
        tracking_number: response.tracking_number,
        shipping_details: response.shipping_details,
      };
    },
    enabled: !!searchedNumber,
    retry: 1,
  });

  const handleSearch = (number: string) => {
    setTrackingNumber(number);
    setSearchedNumber(number);
  };

  const handleSearchAgain = () => {
    setTrackingNumber("");
    setSearchedNumber("");
  };

  const shipment = data?.shipping_details;

  if (isError && searchedNumber && !isLoading) {
    return (
      <TrackingNotFound
        trackingNumber={searchedNumber}
        onSearchAgain={handleSearchAgain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Logo/Header Section */}
      <div className="py-4">
        <div className="max-w-7xl px-4">
          <IndividualLogo />
        </div>
      </div>

      {/* Search Section */}
      <TrackingSearch
        onSearch={handleSearch}
        isLoading={isLoading}
        initialTrackingNumber={tracking_id}
      />

      {/* Loading State */}
      {isLoading && <TrackingLoading />}

      {/* Tracking Results */}
      {shipment && !isLoading && (
        <div className="space-y-0">
          {/* Shipment Details Card */}
          <ShipmentDetails
            trackingId={data.tracking_number}
            service={shipment.shipment_information.carrier}
            date={data.events[data.events.length - 1].date}
            time={data.events[data.events.length - 1].time}
          />

          {/* Map Component */}
          <TrackingMap
            origin={shipment.addresses.origin}
            destination={shipment.addresses.destination}
            estimatedDelivery={
              shipment.shipment_information.estimates.estimatedDeliveryDate
            }
          />

          {/* Timeline Component */}
          <TrackingTimeline
            events={data.events}
            currentStatus={"Shipment in transit"}
          />
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 text-center">
        <p className="text-fluid-xxs text-slate-700">
          Powered by DHL Express • {new Date().getFullYear()} Omenai
        </p>
      </div>
    </div>
  );
}
