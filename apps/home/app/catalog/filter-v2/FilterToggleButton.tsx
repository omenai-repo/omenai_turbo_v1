"use client";

import { useFilterDrawer } from "./FilterDrawerProvider";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { SlidersVertical } from "lucide-react";

export default function FilterToggleButton() {
  const { openDrawer } = useFilterDrawer();
  const { selectedFilters } = filterStore();

  return (
    <button
      onClick={openDrawer}
      className="flex items-center gap-2 px-4 py-2 border border-gray-500 rounded-full transparent hover:bg-slate-50 shadow-sm"
    >
      <SlidersVertical size={16} strokeWidth={1} absoluteStrokeWidth />
      <span className="text-fluid-xxs font-normal">Filters</span>
      {selectedFilters.length > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-dark text-white text-xs rounded-full">
          {selectedFilters.length}
        </span>
      )}
    </button>
  );
}
