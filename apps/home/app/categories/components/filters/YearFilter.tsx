"use client";
import React, { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { filterOptionsType } from "@omenai/shared-types";
const yearFilterOptions = [
  { option: "2020s", value: { min: 2020, max: 2029 } },
  { option: "2010s", value: { min: 2010, max: 2019 } },
  { option: "2000s", value: { min: 2000, max: 2009 } },
  { option: "1990s", value: { min: 1990, max: 1999 } },
  { option: "1980s", value: { min: 1980, max: 1989 } },
  { option: "1970s", value: { min: 1970, max: 1979 } },
  { option: "1960s", value: { min: 1960, max: 1969 } },
  { option: "1950s", value: { min: 1950, max: 1959 } },
  { option: "1940s", value: { min: 1940, max: 1949 } },
  { option: "1930s", value: { min: 1930, max: 1939 } },
  { option: "1920s", value: { min: 1920, max: 1929 } },
  { option: "1910s", value: { min: 1910, max: 1919 } },
  { option: "1900s", value: { min: 1900, max: 1909 } },
  { option: "19th century", value: { min: 1800, max: 1899 } },
  { option: "18th century & Earlier", value: { min: 0, max: 1799 } },
];
export default function YearFilter({
  filterOptions,
}: {
  filterOptions: filterOptionsType;
}) {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="p-2 relative w-fit">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="ring-1 rounded-xl whitespace-nowrap cursor-pointer ring-[#e0e0e0] font-normal text-[13px] text-dark flex justify-between items-center px-3 h-[35px] hover:bg-[#FAFAFA] hover:ring-dark"
      >
        <p className="flex gap-x-2 items-center">
          <span className="font-light">Year</span>
          {filterOptions.year.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded-md bg-dark/10">
              <span className="absolute translate-x-[0%] translate-y-[0%]">
                {filterOptions.year.length}
              </span>
            </span>
          )}
        </p>
        <MdOutlineKeyboardArrowDown />
      </div>
      <FilterOptionBox
        filters={yearFilterOptions}
        label={"year"}
        open={openDropdown}
      />
    </div>
  );
}
