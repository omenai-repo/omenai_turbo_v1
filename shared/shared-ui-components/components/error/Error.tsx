import React from "react";

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full relative animate-fade-in">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded p-6 shadow-lg">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="text-center space-y-6">
          {/* Header Text */}
          <div className="space-y-2">
            <h1 className="text-fluid-3xl font-bold text-dark">
              Oops! Something went wrong
            </h1>
            <p className="text-fluid-base text-dark/60 max-w-sm mx-auto">
              We&apos;ve run into an unexpected issue. Don&apos;t worry — our
              team has already been notified and is working on a fix.
            </p>
          </div>

          {/* Safe Error Details */}
          <div className="bg-white rounded p-4 shadow-sm border border-slate-200 animate-fade-in">
            <p className="text-sm text-slate-600">
              Please try again shortly. If the problem continues, feel free to
              reach out to support for assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 text-fluid-xxs bg-dark text-white font-medium rounded shadow-sm transform transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2"
            >
              Try again
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 text-fluid-xxs bg-white text-dark font-medium rounded shadow-sm border border-slate-300 transform transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              Go home
            </button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-slate-500">
            If this issue persists, please{" "}
            <a
              href="/contact"
              className="text-dark underline underline-offset-2"
            >
              contact support
            </a>
            .
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-50 rounded opacity-50"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-slate-100 rounded opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
