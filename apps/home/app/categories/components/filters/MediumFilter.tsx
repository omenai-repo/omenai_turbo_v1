"use client";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { useState } from "react";
import { filterOptionsType } from "@omenai/shared-types";

const options = [
  "Acrylic",
  "Oil",
  "Fabric",
  "Mixed media",
  "Ink",
  "Collage or other works on paper",
  "Ankara",
  "Photography",
  "Charcoal",
  "Canvas",
  "Paper",
  "Other",
];
const mediumFilterOptions = options.map((option) => ({
  option: option,
  value: option,
}));

export default function MediumFilter({
  filterOptions,
}: {
  filterOptions: filterOptionsType;
}) {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="p-2 relative w-fit">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="ring-1 whitespace-nowrap rounded-full cursor-pointer ring-[#e0e0e0] font-normal text-[13px] text-dark flex justify-between items-center px-3 h-[30px] hover:bg-[#FAFAFA] hover:ring-dark"
      >
        <p className="flex gap-x-2 items-center">
          <span className="text-[14px] font-light">Medium</span>
          {filterOptions.medium.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded-md bg-dark/10">
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
