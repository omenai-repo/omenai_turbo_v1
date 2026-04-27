import Link from "next/link";
import { BsShieldLock } from "react-icons/bs";

export default function NoSubscriptionBlock() {
  return (
    <div className="mt-10 flex h-[75vh] w-full flex-col items-center justify-center rounded-sm bg-dark px-6 py-12 shadow-lg">
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Icon Container with a subtle glow/background */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-8 ring-white/5">
          <BsShieldLock className="text-4xl text-white" />
        </div>

        {/* Improved Text Hierarchy */}
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-white">
          Subscription Required
        </h2>
        <p className="mb-8 text-zinc-400">
          You need an active subscription to use this feature and unlock all
          gallery tools.
        </p>

        {/* Cleaned up, highly interactive button */}
        <Link href="/gallery/billing/plans" className="w-full sm:w-auto">
          <button className="flex w-full items-center justify-center whitespace-nowrap rounded-sm bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:bg-zinc-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
            Activate Subscription
          </button>
        </Link>
        {/* Optional Go Back / Dismiss link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-600 transition-colors"
        >
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
