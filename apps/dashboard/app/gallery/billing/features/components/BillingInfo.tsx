"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function BillingInfo() {
  const { user } = useAuth({ requiredRole: "gallery" });

  return (
    <div className="h-full bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
        Billing Contact
      </h3>

      <div className="space-y-6 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
            {user.name?.charAt(0) || "G"}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-0.5">
              Gallery Name
            </p>
            <p className="text-sm font-semibold text-slate-900 leading-tight">
              {user.name}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase mb-0.5">
              Email Address
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {user.email}
              </p>
              <div
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                title="Verified"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
