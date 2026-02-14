"use client";

export default function TrackingLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Shipment Details Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-14 bg-slate-100 border-b border-slate-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 flex gap-4 border-b md:border-b-0 border-r-0 md:border-r border-slate-100 last:border-0"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-300 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Skeleton */}
      <div className="bg-slate-200 rounded-2xl h-[400px] w-full shadow-sm"></div>

      {/* Timeline Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="h-6 bg-slate-200 rounded w-48 mb-8"></div>

        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                <div className="w-0.5 flex-1 bg-slate-100 my-2"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="h-4 bg-slate-300 rounded w-32 mb-3"></div>
                <div className="h-3 bg-slate-200 rounded w-full max-w-md mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
