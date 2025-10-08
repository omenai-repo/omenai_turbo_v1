// ShipmentDetails.tsx - Display shipment details card
"use client";

import { Package, Truck, Hash, Clock } from "lucide-react";

interface ShipmentDetailsProps {
  trackingId: string;
  service: string;
  date: string;
  time: string;
}

export default function ShipmentDetails({
  trackingId,
  service,
  date,
  time,
}: ShipmentDetailsProps) {
  // const formatDate = (timestamp: string) => {
  //   return new Date(timestamp).toLocaleDateString("en-US", {
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="bg-white rounded shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-200 px-4 md:px-6 py-3 md:py-4">
          <h3 className="text-fluid-base font-medium text-[#0f172a] flex items-center gap-2">
            <Package className="w-4 h-4 md:w-5 md:h-5" />
            Shipment Details
          </h3>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
          {/* Tracking ID */}
          <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4  text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-fluid-base text-gray-600 mb-1 font-normal">
                Tracking ID
              </p>
              <p className="text-fluid-xxs md:text-fluid-base font-medium text-[#0f172a] break-all">
                {trackingId}
              </p>
            </div>
          </div>

          {/* Service Type */}
          <div className="flex items-start gap-3 p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4  text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-fluid-xxs md:text-fluid-base text-gray-600 mb-1 font-normal">
                Service Type
              </p>
              <p className="text-fluid-xxs font-medium text-[#0f172a] break-words">
                {service}
              </p>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded xxs:col-span-2 md:col-span-1">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4  text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-fluid-xxs md:text-fluid-base text-gray-600 mb-1 font-normal">
                Last Updated
              </p>
              <p className="text-fluid-xxs md:text-fluid-base font-medium text-[#0f172a] break-words">
                {date} at {time}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
