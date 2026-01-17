// TrackingNotFound.tsx - Display when tracking info not found
"use client";

import { PackageX, SearchX, AlertCircle } from "lucide-react";

interface TrackingNotFoundProps {
  trackingNumber?: string;
  onSearchAgain: () => void;
}

export default function TrackingNotFound({
  trackingNumber,
  onSearchAgain,
}: TrackingNotFoundProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
      <div className="bg-white rounded shadow-xl border border-gray-100 p-6 md:p-12 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded flex items-center justify-center">
              <PackageX className="w-10 h-10 md:w-12 md:h-12 text-red-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded flex items-center justify-center">
              <SearchX className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-fluid-md font-bold text-[#0f172a] mb-3">
          Tracking Information Not Found
        </h2>

        {/* Tracking Number */}
        {trackingNumber && (
          <div className="inline-block bg-gray-100 rounded px-4 py-2 mb-6">
            <p className="text-fluid-base text-gray-600">
              Tracking Number:{" "}
              <span className="font-mono font-medium text-[#0f172a]">
                {trackingNumber}
              </span>
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-fluid-base text-gray-600 mb-8 max-w-2xl mx-auto">
          We couldn&apos;t find any tracking information for this number. This
          could be because:
        </p>

        {/* Reasons List */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded p-4 md:p-6 mb-8 text-left max-w-2xl mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="text-fluid-xxs text-gray-700">
                <span className="font-medium text-[#0f172a]">
                  • The tracking number is incorrect
                </span>
                <br />
                <span className="text-gray-600">
                  Please check for any typos or missing digits
                </span>
              </p>
              <p className="text-fluid-xxs text-gray-700">
                <span className="font-medium text-[#0f172a]">
                  • The shipment is very recent
                </span>
                <br />
                <span className="text-gray-600">
                  Tracking info may take 24-48 hours to appear in the system
                </span>
              </p>
              <p className="text-fluid-xxs text-gray-700">
                <span className="font-medium text-[#0f172a]">
                  • The shipment hasn&apos;t been picked up yet
                </span>
                <br />
                <span className="text-gray-600">
                  Please wait for the carrier to collect the package
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col xxs:flex-row gap-3 md:gap-4 justify-center items-center">
          <button
            onClick={onSearchAgain}
            className="w-full xxs:w-auto px-4 py-2 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white text-fluid-xxs font-medium rounded hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Try Another Number
          </button>
          <a
            href="mailto:support@omenai.com"
            className="w-full xxs:w-auto px-4 py-2 bg-white border border-[#0f172a] text-[#0f172a] text-fluid-xxs font-medium rounded hover:bg-gray-50 transition-all duration-300"
          >
            Contact Support
          </a>
        </div>

        {/* Help Text */}
        <p className="text-fluid-xxs text-slate-700 mt-8">
          Need help? Check your order confirmation email for the correct
          tracking number
        </p>
      </div>
    </div>
  );
}
