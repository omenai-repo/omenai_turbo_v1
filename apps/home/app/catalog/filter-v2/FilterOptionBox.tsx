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
        className="overflow-hidden transition-all duration-300 mt-1"
        style={{ height: height }}
      >
        <div
          ref={contentRef}
          className="flex flex-col p-2 gap-1 border border-dark/10 rounded bg-white"
        >
          {filters.map((filter) => (
            <label
              key={filter.option}
              className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={hasFilterValue(selectedFilters, filter.option)}
                value={JSON.stringify(filter.value)}
                onChange={(e) => handleChange(e, filter.option)}
                className="w-4 h-4 text-dark bg-gray-100 border-dark/10 rounded focus:ring-dark focus:ring-2"
              />
              <span className="ml-2 text-fluid-xxs font-normal">
                {filter.option}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
