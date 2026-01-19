"use client";

import { useFilterDrawer } from "./FilterDrawerProvider";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { SlidersVertical } from "lucide-react";

export default function FilterToggleButton() {
  const { openDrawer } = useFilterDrawer();
  const { selectedFilters } = filterStore();

  return (
    <button onClick={openDrawer} className="flex items-center gap-4 group">
      <div className="w-10 h-10 border border-neutral-200 flex items-center justify-center group-hover:border-black transition-colors">
        <SlidersVertical size={14} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark">
          Filter Archive
        </span>
        {selectedFilters.length > 0 && (
          <span className="text-[9px] text-neutral-400 uppercase tracking-widest">
            {selectedFilters.length} Parameters Active
          </span>
        )}
      </div>
    </button>
  );
}
