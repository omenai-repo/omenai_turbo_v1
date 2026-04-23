"use client";

import React, { useState } from "react";
import CurationWorkspace from "./CurationWorkSpace";

const AVAILABLE_FEEDS: {
  id: "curator_picks" | "featured_feed";
  label: string;
}[] = [
  { id: "curator_picks", label: "Curator Picks" },
  { id: "featured_feed", label: "Featured Homepage Feed" },
];

export default function CurationManagerPage() {
  const [selectedFeed, setSelectedFeed] = useState<
    (typeof AVAILABLE_FEEDS)[0]["id"]
  >(AVAILABLE_FEEDS[0].id);

  return (
    <div className="box-border antialiased bg-[#FAF8F5] h-screen flex flex-col font-sans">
      <header className="bg-[#FAF8F5] border-b border-[#E8E4DF] px-4 h-[68px] flex items-center justify-between shrink-0 relative after:absolute after:bottom-0 after:left-10 after:right-10 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#D4CFC9] after:to-transparent">
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-serif text-[1.6rem] font-medium text-[#1C1917] tracking-[0.01em] leading-none">
            Feed Manager
          </h1>
          <span className="text-[0.7rem] font-normal text-[#78716C] tracking-[0.12em] uppercase">
            Curatorial Workspace
          </span>
        </div>

        <div className="flex items-center gap-4 bg-[#F3F0EB] border border-[#E8E4DF] rounded-sm p-[0.2rem] pl-4">
          <span className="text-[0.68rem] font-medium text-[#78716C] tracking-[0.1em] uppercase whitespace-nowrap">
            Editing
          </span>
          <div className="flex gap-1">
            {AVAILABLE_FEEDS.map((feed) => (
              <button
                key={feed.id}
                onClick={() => setSelectedFeed(feed.id)}
                className={`px-[0.85rem] py-[0.35rem] text-[0.72rem] font-medium tracking-[0.04em] rounded-[1px] transition-all duration-[180ms] ease-in-out ${
                  selectedFeed === feed.id
                    ? "bg-[#1C1917] text-[#FAF8F5]"
                    : "bg-transparent text-[#44403C] hover:bg-[#E8E4DF] hover:text-[#1C1917]"
                }`}
              >
                {feed.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <CurationWorkspace key={selectedFeed} curationType={selectedFeed} />
    </div>
  );
}
