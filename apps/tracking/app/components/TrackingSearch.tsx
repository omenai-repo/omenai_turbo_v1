// TrackingSearch.tsx - Search box component
"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
interface TrackingSearchProps {
  onSearch: (trackingNumber: string) => void;
  initialTrackingNumber: string;
  isLoading?: boolean;
}

export default function TrackingSearch({
  onSearch,
  initialTrackingNumber,
  isLoading,
}: TrackingSearchProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onSearch(trackingNumber.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-2 rounded shadow">
            <Package className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-fluid-lg font-semibold text-[#0f172a] mb-3">
          Track Your Artwork
        </h1>
        <p className="text-fluid-base text-gray-600 max-w-2xl mx-auto">
          Enter your tracking number below to see tracking updates on your
          shipment
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0f172a] to-[#334155] rounded opacity-30 group-hover:opacity-50 blur transition duration-300"></div>
          <div className="relative flex items-center bg-white rounded shadow overflow-hidden">
            <div className="pl-4 md:pl-6">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-dark/40" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter Order ID or Shipment tracking number"
              className={INPUT_CLASS}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !trackingNumber.trim()}
              className="mx-2 md:mx-3 px-4 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white text-fluid-xxs font-medium rounded hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
            >
              {isLoading ? "Tracking..." : "Track"}
            </button>
          </div>
        </div>
      </form>

      {/* Info Text */}
      <p className="text-center text-fluid-xxs text-gray-500 mt-6">
        Your tracking number can be found in your order confirmation email
      </p>
    </div>
  );
}
