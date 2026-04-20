import React from "react";

export const FairEventSkeleton = () => {
  return (
    <main className="min-h-screen bg-white pb-32 animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full h-[60vh] md:h-[70vh] bg-neutral-100" />

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Info Block */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="w-24 h-3 bg-neutral-200 rounded-sm" />
            <div className="w-full h-10 bg-neutral-200 rounded-sm" />
            <div className="w-40 h-4 bg-neutral-100 rounded-sm pt-4" />
          </div>
          {/* Description Block */}
          <div className="w-full md:w-1/2 space-y-3">
            <div className="w-full h-4 bg-neutral-100 rounded-sm" />
            <div className="w-full h-4 bg-neutral-100 rounded-sm" />
            <div className="w-2/3 h-4 bg-neutral-100 rounded-sm" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] bg-neutral-50 rounded-sm" />
        ))}
      </div>
    </main>
  );
};
