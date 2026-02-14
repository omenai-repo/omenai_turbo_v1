"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";

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
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex justify-center items-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2">
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-2.5 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Track Your Artwork
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Enter your tracking number below to see real-time updates on your
            shipment's journey.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-dark rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500"></div>

          <div className="relative flex items-center bg-white rounded-xl border border-slate-200  transition-all duration-300 overflow-hidden p-1.5">
            <div className="pl-4 pr-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter Order ID or Tracking Number"
              className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-slate-900 placeholder:text-slate-400 text-base py-3 px-2 font-medium"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !trackingNumber.trim()}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Tracking
                </span>
              ) : (
                "Track"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Info Text */}
      <p className="text-center text-xs text-slate-400 mt-6 font-medium">
        Example: 84920194 • Found in your order email
      </p>
    </div>
  );
}
