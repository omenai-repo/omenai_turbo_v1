"use client";

import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { hasFilterValue } from "@omenai/shared-utils/src/checkIfFilterExists";
import { ChangeEvent } from "react";

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
  const handleChange = (e: ChangeEvent<HTMLInputElement>, filter: string) => {
    if (e.target.checked) {
      updateFilter(label, e.target.value);
      setSelectedFilters(e.target.value, filter, label);
    } else {
      // removeFilter(label, e.target.value);
      removeSingleFilterSelection(filter);
    }
  };
  return (
    <div
      className={`${
        open ? "block" : "hidden"
      } max-w-[300px] w-[300px] h-auto max-h-auto bg-white overflow-y-scroll absolute top-[100%] left-0 z-30 p-2`}
    >
      <div
        id="dropdownBgHover"
        className={`z-10 w-full bg-white border border-dark/10 dark:bg-gray-700`}
      >
        <ul
          className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownBgHoverButton"
        >
          {filters.map((filter) => {
            return (
              <li key={filter.option}>
                <span className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                  <input
                    id={filter.option}
                    type="checkbox"
                    checked={hasFilterValue(selectedFilters, filter.option)}
                    value={JSON.stringify(filter.value)}
                    onChange={(e) => handleChange(e, filter.option)}
                    className="w-4 h-4 text-dark bg-gray-100 border-dark/10 rounded focus:ring-dark dark:focus:ring-dark dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    htmlFor={filter.option}
                    className="w-full ms-2 text-[14px] font-normal text-dark rounded dark:text-white"
                  >
                    {filter.option}
                  </label>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
