import React from "react";

export const ShowDetailsSkeleton = () => {
  return (
    <main className="min-h-screen bg-white pb-32 animate-pulse">
      {/* 1. HERO SKELETON */}
      <section className="relative w-full h-[60vh] md:h-[75vh] bg-neutral-200">
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="w-32 h-3 bg-neutral-300 rounded-sm" />
            <div className="w-3/4 md:w-1/2 h-12 md:h-16 bg-neutral-300 rounded-sm mt-2" />
          </div>
        </div>
      </section>

      {/* 2. CONTEXT & STATEMENT SKELETON */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Logistics Column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-3 border-l border-neutral-200 pl-4"
              >
                <div className="w-16 h-2 bg-neutral-200 rounded-sm" />
                <div className="w-40 h-4 bg-neutral-200 rounded-sm" />
              </div>
            ))}
          </div>

          {/* Statement Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="w-48 h-3 bg-neutral-200 rounded-sm mb-4" />
            <div className="w-full h-4 bg-neutral-100 rounded-sm" />
            <div className="w-full h-4 bg-neutral-100 rounded-sm" />
            <div className="w-5/6 h-4 bg-neutral-100 rounded-sm" />
            <div className="w-full h-4 bg-neutral-100 rounded-sm mt-4" />
            <div className="w-4/5 h-4 bg-neutral-100 rounded-sm" />
          </div>
        </div>
      </section>

      {/* 3. ARTWORKS GRID SKELETON */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 border-t border-neutral-100 pt-20">
        <div className="flex justify-between items-end mb-12">
          <div className="w-48 h-8 bg-neutral-200 rounded-sm" />
          <div className="w-16 h-3 bg-neutral-200 rounded-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              {/* Artwork Matte */}
              <div className="w-full aspect-[4/5] bg-neutral-100 rounded-sm" />
              {/* Metadata */}
              <div className="flex justify-between mt-2">
                <div className="w-24 h-3 bg-neutral-100 rounded-sm" />
                <div className="w-12 h-2 bg-neutral-100 rounded-sm" />
              </div>
              <div className="w-3/4 h-4 bg-neutral-200 rounded-sm" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
