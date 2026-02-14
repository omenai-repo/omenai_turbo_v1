"use client";

import { PackageX, Search, HelpCircle, ArrowRight } from "lucide-react";

interface TrackingNotFoundProps {
  trackingNumber?: string;
  onSearchAgain: () => void;
}

export default function TrackingNotFound({
  trackingNumber,
  onSearchAgain,
}: TrackingNotFoundProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-12 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <PackageX className="w-10 h-10 text-amber-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tracking Details Not Found
        </h2>

        {trackingNumber && (
          <p className="text-slate-500 mb-8">
            We couldn't find any information for{" "}
            <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {trackingNumber}
            </span>
          </p>
        )}

        {/* Reasons */}
        <div className="bg-slate-50 rounded-xl p-6 text-left mb-8 border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" /> Possible Reasons:
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              The carrier hasn't scanned the package yet (wait 24h).
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              There is a typo in the tracking number.
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
              The order was just placed and is being packed.
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onSearchAgain}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            Try Another Number
          </button>

          <a
            href="mailto:support@omenai.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all"
          >
            Contact Support
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
