"use client";
import React, { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { filterOptionsType } from "@omenai/shared-types";

const rarityFilterOptions = [
  { option: "Unique", value: "Unique" },
  { option: "Limited edition", value: "Limited edition" },
  { option: "Open edition", value: "Open edition" },
  { option: "Unknown edition", value: "Unknown edition" },
];
export default function RarityFilter({
  filterOptions,
}: {
  filterOptions: filterOptionsType;
}) {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="p-2 md:relative w-full md:w-fit">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="ring-1 whitespace-nowrap rounded cursor-pointer ring-[#e0e0e0] font-normal text-[13px] text-dark flex justify-between items-center px-3 h-[35px] hover:bg-[#FAFAFA] hover:ring-dark"
      >
        <p className="flex gap-x-2 items-center">
          <span className="font-light">Rarity</span>
          {filterOptions.rarity.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded bg-dark/10">
              <span className="absolute translate-x-[0%] translate-y-[0%]">
                {filterOptions.rarity.length}
              </span>
            </span>
          )}
        </p>
        <MdOutlineKeyboardArrowDown />
      </div>
      <FilterOptionBox
        filters={rarityFilterOptions}
        label={"rarity"}
        open={openDropdown}
      />
    </div>
  );
}
