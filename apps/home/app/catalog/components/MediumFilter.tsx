"use client";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { useState } from "react";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";

const options = [
  "Photography",
  "Works on paper",
  "Acrylic on canvas/linen/panel",
  "Mixed media on paper/canvas",
  "Sculpture (Resin/plaster/clay)",
  "Oil on canvas/panel",
  "Sculpture (Bronze/stone/metal)",
];
const mediumFilterOptions = options.map((option) => ({
  option: option,
  value: option,
}));

export default function MediumFilter() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const { filterOptions } = filterStore();

  return (
    <div className="p-2 md:relative w-full md:w-fit">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="ring-1 whitespace-nowrap rounded cursor-pointer ring-[#e0e0e0] font-normal text-[13px] text-dark flex justify-between items-center px-3 h-[35px] hover:bg-[#FAFAFA] hover:ring-dark"
      >
        <p className="flex gap-x-2 items-center">
          <span className="text-fluid-xs font-light">Medium</span>
          {filterOptions.medium.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded bg-dark/10">
              <span className="absolute translate-x-[0%] translate-y-[0%]">
                {filterOptions.medium.length}
              </span>
            </span>
          )}
        </p>
        <MdOutlineKeyboardArrowDown />
      </div>
      <FilterOptionBox
        filters={mediumFilterOptions}
        label={"medium"}
        open={openDropdown}
      />
    </div>
  );
}
