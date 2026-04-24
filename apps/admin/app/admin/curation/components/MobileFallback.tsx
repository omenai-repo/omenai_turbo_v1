import React from "react";

export default function MobileFallback() {
  return (
    <div className="flex md:hidden flex-col items-center justify-center h-[calc(100vh-68px)] text-center p-8 text-[#78716C] font-sans">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <h2 className="font-serif text-[1.6rem] font-normal text-[#1C1917] mt-4 mb-2">
        Desktop Only
      </h2>
      <p className="text-[0.85rem] max-w-[260px] leading-[1.6]">
        The curation workspace is designed for desktop use. Please open on a
        larger screen.
      </p>
    </div>
  );
}
