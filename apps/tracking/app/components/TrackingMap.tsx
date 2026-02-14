// TrackingMap.tsx - Map showing origin and destination
"use client";

import { AddressTypes, ShipmentCoords } from "@omenai/shared-types";
import { Navigation, MapPin, CalendarClock, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

// Fix: Ensure the import path matches the file name (case-sensitive)
const MapView = dynamic(() => import("./Mapview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
      <span className="text-slate-400 text-sm">Loading Map...</span>
    </div>
  ),
});

interface TrackingMapProps {
  origin: AddressTypes;
  destination: AddressTypes;
  estimatedDelivery?: string;
  coordinates: ShipmentCoords | null;
}

export default function TrackingMap({
  origin,
  destination,
  estimatedDelivery,
  coordinates,
}: TrackingMapProps) {
  const formatDeliveryDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-8">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header / Delivery Estimate */}
        <div className="bg-white border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Route Overview
              </h3>
              <p className="text-xs text-slate-500">International Shipment</p>
            </div>
          </div>

          {estimatedDelivery && (
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-900">
                <span className="font-medium text-emerald-700 mr-1">
                  Est. Delivery:
                </span>
                <span className="font-bold">
                  {formatDeliveryDate(estimatedDelivery)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Map Container */}
        {/* The MapView component inside handles its own height, but we enforce a container here */}
        <div className="w-full h-[400px] md:h-[500px] relative z-0 bg-slate-50">
          {/* We pass coordinates. If null, MapView handles default/fallback */}
          <MapView
            coordinates={coordinates}
            originCity={`${origin.state}, ${origin.country}`}
            destinationCity={`${destination.state}, ${destination.country}`}
          />
        </div>

        {/* Origin & Destination Detail Strip */}
        <div className="relative bg-white p-6 md:p-8">
          {/* Decorative Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-slate-100 -translate-y-1/2 z-0">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Origin */}
            <div className="group">
              <div className="flex flex-col md:items-start text-left bg-white p-4 md:p-0 rounded-xl border md:border-0 border-slate-100 hover:bg-slate-50 md:hover:bg-transparent transition-colors">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Origin
                </p>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-1 shrink-0 group-hover:text-blue-500 transition-colors" />
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                      {origin.address_line}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {origin.city && `${origin.city}, `}
                      {origin.state && `${origin.state} `}
                      {origin.zip}
                    </p>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">
                      {origin.countryCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Arrow (Visual Separator) */}
            <div className="md:hidden flex justify-center text-slate-300">
              <ArrowRight className="w-6 h-6 rotate-90" />
            </div>

            {/* Destination */}
            <div className="group">
              <div className="flex flex-col md:items-end md:text-right bg-white p-4 md:p-0 rounded-xl border md:border-0 border-slate-100 hover:bg-slate-50 md:hover:bg-transparent transition-colors">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center md:justify-end gap-2">
                  Destination
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </p>
                <div className="flex md:flex-row-reverse items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-1 shrink-0 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                      {destination.address_line}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {destination.city && `${destination.city}, `}
                      {destination.state && `${destination.state} `}
                      {destination.zip}
                    </p>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">
                      {destination.countryCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
