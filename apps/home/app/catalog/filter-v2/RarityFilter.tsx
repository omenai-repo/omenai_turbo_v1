"use client";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

type Props = {
  open: boolean;
  toggleOpen: () => void;
};

const rarityFilterOptions = [
  { option: "Unique", value: "Unique" },
  { option: "Limited edition", value: "Limited edition" },
  { option: "Open edition", value: "Open edition" },
  { option: "Unknown edition", value: "Unknown edition" },
];

export default function RarityFilter({ open, toggleOpen }: Props) {
  const { filterOptions } = filterStore();

  return (
    <div className="p-2 w-full">
      <div
        onClick={toggleOpen}
        className={`${SELECT_CLASS} flex justify-between items-center`}
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
        <MdOutlineKeyboardArrowDown
          className={`${open ? "rotate-180" : ""} transition-transform`}
        />
      </div>

      <FilterOptionBox
        filters={rarityFilterOptions}
        label="rarity"
        open={open}
      />
    </div>
  );
}
