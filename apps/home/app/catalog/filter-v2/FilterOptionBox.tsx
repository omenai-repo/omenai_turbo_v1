"use client";

import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { hasFilterValue } from "@omenai/shared-utils/src/checkIfFilterExists";
import { ChangeEvent, useRef, useState, useEffect } from "react";

type FilterOptionBoxTypes = {
  filters: FilterValueType[];
  label: string;
  open: boolean;
};

type FilterValueType = {
  option: string;
  value: { min: number; max: number } | string;
};

export default function FilterOptionBox({
  filters,
  label,
  open,
}: FilterOptionBoxTypes) {
  const {
    updateFilter,
    setSelectedFilters,
    removeSingleFilterSelection,
    selectedFilters,
  } = filterStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0);
    }
  }, [open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, filter: string) => {
    if (e.target.checked) {
      updateFilter(label, e.target.value);
      setSelectedFilters(e.target.value, filter, label);
    } else {
      removeSingleFilterSelection(filter);
    }
  };

  return (
    <div className="w-full">
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ height: height }}
      >
        <div ref={contentRef} className="flex flex-col py-4 gap-1 bg-white">
          {filters.map((filter) => (
            <label
              key={filter.option}
              className="flex items-center justify-between py-2 group cursor-pointer"
            >
              <span className="text-[11px] tracking-wider text-slate-600 group-hover:text-dark transition-colors">
                {filter.option}
              </span>
              <input
                type="checkbox"
                checked={hasFilterValue(selectedFilters, filter.option)}
                value={JSON.stringify(filter.value)}
                onChange={(e) => handleChange(e, filter.option)}
                className="w-3 h-3 appearance-none border border-slate-400 checked:bg-dark checked:border-dark transition-all cursor-pointer rounded-none"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
