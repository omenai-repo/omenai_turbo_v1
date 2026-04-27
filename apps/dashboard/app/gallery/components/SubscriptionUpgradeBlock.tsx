import React from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export default function SubscriptionUpgradeBlocker() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-12 text-center shadow-sm">
      {/* Icon Container */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50 ring-8 ring-slate-50">
        <Lock className="h-7 w-7 text-slate-700" strokeWidth={2} />
      </div>

      {/* Heading */}
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-dark">
        Access Restricted
      </h2>

      {/* Description */}
      <p className="mb-8 max-w-md text-slate-600 leading-relaxed">
        You are not eligible to access this resource because it requires a
        higher subscription tier. Upgrade to the{" "}
        <strong className="font-semibold text-dark">Principal</strong> plan to
        unlock this feature and gain full access.
      </p>

      {/* CTA Button */}
      <Link
        href="/gallery/billing/plans"
        className="group inline-flex items-center justify-center gap-2 rounded-sm bg-dark px-6 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 active:scale-95"
      >
        <Sparkles className="h-4 w-4 text-amber-300" />
        Upgrade to Principal Plan
      </Link>

      {/* Optional Go Back / Dismiss link */}
      <button
        onClick={() => window.history.back()}
        className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        Go back to previous page
      </button>
    </div>
  );
}
