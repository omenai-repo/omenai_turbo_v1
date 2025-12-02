"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function BillingInfo() {
  const { user } = useAuth({ requiredRole: "gallery" });
  return (
    <div className="w-full">
      {/* Design 1: Clean Card Style */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[250px] flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-fluid-xxs font-semibold text-slate-900">
              Billing Information
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-normal text-slate-500 uppercase tracking-wide">
                Gallery Name
              </p>
              <p className="text-fluid-xxs font-normal text-slate-900">
                {user.name}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-normal text-slate-500 uppercase tracking-wide">
                Email Address
              </p>
              <p className="text-fluid-xxs font-normal text-slate-900 flex items-center gap-2">
                {user.email}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-green-100 text-green-700">
                  Verified
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
