import React from "react";

export const AllFairsEventsSkeleton = () => {
  return (
    <div className="w-full animate-pulse pb-32">
      {/* Current Events Skeleton (Assuming 2 active) */}
      <div className="mb-20">
        <div className="w-48 h-8 bg-neutral-200 rounded-sm mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-full aspect-[3/2] bg-neutral-100 rounded-sm"
            />
          ))}
        </div>
      </div>

      {/* Split Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* Past Events (Left - 8 cols) */}
        <div className="lg:col-span-8">
          <div className="w-40 h-8 bg-neutral-200 rounded-sm mb-8" />
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center py-6 border-b border-neutral-100"
              >
                <div className="w-16 h-16 bg-neutral-200 rounded-sm shrink-0" />
                <div className="ml-6 space-y-2 w-full">
                  <div className="w-1/2 h-5 bg-neutral-200 rounded-sm" />
                  <div className="w-1/3 h-4 bg-neutral-100 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events (Right - 4 cols) */}
        <div className="lg:col-span-4">
          <div className="w-48 h-8 bg-neutral-200 rounded-sm mb-8" />
          <div className="flex flex-col space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="w-3/4 h-5 bg-neutral-200 rounded-sm" />
                <div className="w-1/2 h-4 bg-neutral-100 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
