// TrackingMap.tsx - Map showing origin and destination
"use client";

import { AddressTypes } from "@omenai/shared-types";
import { Navigation, Package } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./Mapview"), {
  ssr: false, // ⬅️ ensures it only runs on client
});
interface TrackingMapProps {
  origin: AddressTypes;
  destination: AddressTypes;
  estimatedDelivery?: string;
}

export default function TrackingMap({
  origin,
  destination,
  estimatedDelivery,
}: TrackingMapProps) {
  // const formatLocation = (location: AddressTypes) => {
  //   return `${location.address_line}, ${location.countryCode}`;
  // };

  const formatDeliveryDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = () => {
    // if (!estimatedTimeFrame) return null;

    // const from = new Date(estimatedTimeFrame.estimatedFrom);
    // const through = new Date(estimatedTimeFrame.estimatedThrough);

    // return `${from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${through.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    return "Date range not available";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Delivery Estimate */}
      {estimatedDelivery && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded p-4 md:p-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-fluid-base md:text-fluid-base font-medium text-[#0f172a] mb-1">
                Estimated Delivery Date
              </h3>
              <p className="text-fluid-xxs md:text-fluid-base font-semibold text-amber-700">
                {estimatedDelivery
                  ? formatDeliveryDate(estimatedDelivery)
                  : formatDateRange()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Route Card */}
      <div className="bg-white rounded shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-4 md:p-6">
          <h3 className="text-fluid-xxs md:text-fluid-base font-medium text-white flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Shipment Route
          </h3>
        </div>

        {/* Map Placeholder with Visual Route */}
        <div className="w-full  h-[400px]">
          <MapView />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-gray-50">
          <div className="bg-white rounded p-4 shadow-sm">
            <p className="text-fluid-xxs md:text-fluid-base text-gray-500 mb-1 font-medium">
              From
            </p>
            <p className="text-fluid-xxs md:text-fluid-base font-semibold text-[#0f172a]">
              {origin.address_line}
            </p>
            <p className="text-fluid-xxs md:text-fluid-base text-gray-600">
              {origin.zip && `${origin.zip}, `}
              {origin.countryCode}
            </p>
          </div>
          <div className="bg-white rounded p-4 shadow-sm">
            <p className="text-fluid-xxs md:text-fluid-base text-gray-500 mb-1 font-medium">
              To
            </p>
            <p className="text-fluid-xxs md:text-fluid-base font-semibold text-[#0f172a]">
              {destination.address_line}
            </p>
            <p className="text-fluid-xxs md:text-fluid-base text-gray-600">
              {destination.zip && `${destination.zip}, `}
              {destination.countryCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
