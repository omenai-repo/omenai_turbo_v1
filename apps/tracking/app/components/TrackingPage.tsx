// TrackingPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PackageCheck, ShieldCheck, Clock } from "lucide-react";

import TrackingSearch from "./TrackingSearch";
import ShipmentDetails from "./ShipmentDetails";
import TrackingMap from "./TrackingMap";
import TrackingTimeline from "./TrackingTimeline";
import TrackingNotFound from "./TrackingNotFound";
import TrackingLoading from "./TrackingLoading";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { getTrackingData } from "@omenai/shared-services/orders/getTrackingData";

export default function TrackingPage() {
  const [searchedNumber, setSearchedNumber] = useState<string>("");
  const searchParams = useSearchParams();
  const tracking_id = searchParams.get("tracking_id");

  useEffect(() => {
    if (tracking_id) {
      setSearchedNumber(tracking_id);
    }
  }, [tracking_id]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tracking", searchedNumber],
    queryFn: async () => {
      const response = await getTrackingData(searchedNumber);

      if (!response?.isOk)
        throw new Error(
          response?.message ||
            "Tracking data currently unavailable. Please try again",
        );

      return {
        events: response.events || [],
        coordinates: response.coordinates,
        order_date: response.order_date,
        artwork_data: response.artwork_data,
        tracking_number: response.tracking_number,
        shipping_details: response.shipping_details,
      };
    },
    enabled: !!searchedNumber,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  const handleSearch = (number: string) => {
    setSearchedNumber(number);
  };

  const handleSearchAgain = () => {
    setSearchedNumber("");
  };

  const shipment = data?.shipping_details;
  const hasEvents = data?.events && data.events.length > 0;

  if (isError && searchedNumber && !isLoading) {
    return (
      <TrackingNotFound
        trackingNumber={searchedNumber}
        onSearchAgain={handleSearchAgain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navbar / Logo */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <IndividualLogo />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20">
        <TrackingSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          initialTrackingNumber={searchedNumber}
        />

        {isLoading && <TrackingLoading />}

        {shipment && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {hasEvents ? (
              <>
                <ShipmentDetails
                  trackingId={data.tracking_number}
                  service={shipment.shipment_information.carrier}
                  date={data.events[data.events.length - 1].date}
                  time={data.events[data.events.length - 1].time}
                />

                <TrackingMap
                  coordinates={data.coordinates}
                  origin={shipment.addresses.origin}
                  destination={shipment.addresses.destination}
                  estimatedDelivery={
                    shipment.shipment_information.estimates
                      .estimatedDeliveryDate
                  }
                />

                <TrackingTimeline
                  events={data.events}
                  currentStatus="Shipment in Transit"
                />
              </>
            ) : (
              /* No Events / Pre-Transit State */
              <div className="max-w-4xl mx-auto px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-8 md:p-12 text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                        <PackageCheck className="w-10 h-10 text-blue-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">
                        We've Received Your Order
                      </h2>
                      <p className="text-slate-500 max-w-lg mx-auto">
                        Your shipment details have been generated. The carrier
                        has not yet scanned the package, but it is currently
                        being prepared for dispatch.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-6">
                      <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl text-left hover:bg-slate-50 transition-colors">
                        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            Secure Handling
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Artwork is being securely packaged and prepared for
                            international transit.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl text-left hover:bg-slate-50 transition-colors">
                        <Clock className="w-6 h-6 text-blue-500 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            Awaiting Scan
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Tracking updates will begin automatically once the
                            courier collects the item.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                        Tracking Number
                      </p>
                      <p className="font-mono text-xl text-slate-900">
                        {data.tracking_number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">
            Powered by DHL Express • © {new Date().getFullYear()} Omenai
          </p>
        </div>
      </footer>
    </div>
  );
}
