import React from "react";

export const FeaturedGalleriesSkeleton = () => {
  const skeletonArray = Array.from({ length: 5 });

  return (
    <div className="flex w-full space-x-6 overflow-hidden">
      {skeletonArray.map((_, index) => (
        <div
          key={index}
          className="flex-[0_0_75%] sm:flex-[0_0_40%] md:flex-[0_0_25%] lg:flex-[0_0_20%] min-w-0"
        >
          <div className="p-6 border border-neutral-100 bg-white rounded-sm flex flex-col items-center text-center gap-4 animate-pulse">
            {/* Logo Skeleton */}
            <div className="w-20 h-20 bg-neutral-100 rounded-full" />

            {/* Text Skeletons */}
            <div className="w-3/4 h-5 bg-neutral-100 rounded-sm" />
            <div className="w-1/2 h-3 bg-neutral-100 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
};
