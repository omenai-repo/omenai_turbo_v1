// components/public/ShowsCarouselSkeleton.tsx
import React from "react";

export const ShowsCarouselSkeleton = () => {
  const skeletonArray = Array.from({ length: 4 });

  return (
    <div className="flex w-full space-x-6 md:space-x-8 overflow-hidden">
      {skeletonArray.map((_, index) => (
        <div
          key={index}
          className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%] min-w-0"
        >
          {/* CHANGED: aspect-[4/5] to aspect-[3/2] */}
          <div className="w-full aspect-[3/2] bg-neutral-100 animate-pulse rounded-sm mb-4"></div>

          <div className="flex flex-col space-y-2 pr-4">
            <div className="h-3 w-1/3 bg-neutral-100 animate-pulse rounded-sm"></div>
            <div className="h-5 w-3/4 bg-neutral-100 animate-pulse rounded-sm mt-1"></div>
            <div className="h-2 w-1/2 bg-neutral-100 animate-pulse rounded-sm mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
