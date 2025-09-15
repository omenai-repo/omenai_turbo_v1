"use client";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { useState } from "react";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
const priceFilterOptions = [
  { option: "$0 to $1000", value: { min: 0, max: 1000 } },
  { option: "$1001 to $10000", value: { min: 1001, max: 10000 } },
  { option: "$10001 to $50000", value: { min: 10001, max: 50000 } },
  { option: "$50001 to $100000", value: { min: 50001, max: 100000 } },
  { option: "$100001 to $500000", value: { min: 100001, max: 500000 } },
  { option: "$500000+", value: { min: 500001, max: 10000000000 } },
];
export default function PriceFilter() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const { filterOptions } = filterStore();
  return (
    <div className="p-2 md:relative w-full md:w-fit">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="ring-1 rounded whitespace-nowrap cursor-pointer ring-[#e0e0e0] font-normal text-fluid-xxs text-dark flex justify-between items-center px-3 h-[30px] hover:bg-[#FAFAFA] hover:ring-dark"
      >
        <p className="flex gap-x-2 items-center">
          <span className="font-light">Price</span>
          {filterOptions.price.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded bg-dark/10">
              <span className="absolute translate-x-[0%] translate-y-[0%]">
                {filterOptions.price.length}
              </span>
            </span>
          )}
        </p>
        <MdOutlineKeyboardArrowDown />
      </div>
      {/* Filter options */}
      <FilterOptionBox
        filters={priceFilterOptions}
        label={"price"}
        open={openDropdown}
      />
    </div>
  );
}
