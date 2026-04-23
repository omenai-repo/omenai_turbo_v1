// components/public/homepage/Skeletons.tsx
import React from "react";

export function CuratorsPicksSkeleton() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-20 border-b border-[#E8E4DF] animate-pulse">
      <div className="max-w-[1700px] mx-auto">
        <header className="mb-16 max-w-[600px]">
          <div className="h-10 w-64 bg-[#E8E4DF] rounded-[2px] mb-4"></div>
          <div className="w-[60px] h-[3px] bg-[#E8E4DF] mb-5"></div>
          <div className="h-5 w-96 bg-[#E8E4DF] rounded-[2px]"></div>
        </header>
        <div className="flex overflow-hidden gap-8 pb-12 -mx-6 px-6 md:mx-0 md:px-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[300px] sm:min-w-[340px] md:min-w-[380px] flex flex-col gap-4"
            >
              <div className="w-full pb-[133%] bg-[#E8E4DF] rounded-[2px]"></div>
              <div className="h-4 w-3/4 bg-[#E8E4DF] rounded-[2px]"></div>
              <div className="h-3 w-1/2 bg-[#E8E4DF] rounded-[2px]"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedFeedSkeleton() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-20 bg-[#FAF8F5] animate-pulse">
      <div className="max-w-[1700px] mx-auto">
        <header className="mb-16 max-w-[600px]">
          <div className="h-10 w-48 bg-[#E8E4DF] rounded-[2px] mb-4"></div>
          <div className="w-[60px] h-[3px] bg-[#E8E4DF] mb-5"></div>
          <div className="h-5 w-80 bg-[#E8E4DF] rounded-[2px]"></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-full pb-[80%] bg-[#E8E4DF] rounded-[2px]"></div>
              <div className="h-6 w-full bg-[#E8E4DF] rounded-[2px]"></div>
              <div className="h-4 w-2/3 bg-[#E8E4DF] rounded-[2px]"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
