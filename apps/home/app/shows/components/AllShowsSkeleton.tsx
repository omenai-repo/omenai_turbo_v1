import React from "react";

export const AllShowsSkeleton = () => {
  const skeletonArray = Array.from({ length: 12 });

  return (
    <div className="w-full animate-pulse">
      {/* Filter Strip Skeleton */}
      <div className="flex gap-8 border-b border-neutral-200 mb-12 pb-4">
        <div className="w-12 h-4 bg-neutral-200 rounded-sm" />
        <div className="w-20 h-4 bg-neutral-100 rounded-sm" />
        <div className="w-16 h-4 bg-neutral-100 rounded-sm" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
        {skeletonArray.map((_, index) => (
          <div key={index} className="flex flex-col">
            <div className="w-full aspect-[3/2] bg-neutral-100 rounded-sm mb-4" />
            <div className="h-3 w-1/3 bg-neutral-100 rounded-sm mb-2" />
            <div className="h-5 w-3/4 bg-neutral-100 rounded-sm mb-2" />
            <div className="h-2 w-1/2 bg-neutral-100 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};
