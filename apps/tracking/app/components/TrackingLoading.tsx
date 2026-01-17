// TrackingLoading.tsx - Loading skeleton component
"use client";

export default function TrackingLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-pulse">
      {/* Shipment Details Skeleton */}
      <div className="bg-white rounded shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-300">
          <div className="h-5 md:h-6 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 md:p-4 bg-gray-100 rounded"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Skeleton */}
      <div className="bg-white rounded shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-200 p-4 md:p-6">
          <div className="h-6 md:h-7 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="bg-gray-100 p-6 md:p-12">
          <div className="h-32 md:h-48 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-gray-50">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-200 rounded p-4 h-20"></div>
          ))}
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 md:h-7 bg-gray-300 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex gap-4 md:gap-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1 bg-gray-100 rounded p-4 md:p-6 space-y-3">
              <div className="h-3 bg-gray-300 rounded w-32"></div>
              <div className="h-5 bg-gray-300 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
