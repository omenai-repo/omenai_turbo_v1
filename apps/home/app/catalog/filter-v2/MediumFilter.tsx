"use client";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

type Props = {
  open: boolean;
  toggleOpen: () => void;
};

const mediumOptions = [
  "Photography",
  "Works on paper",
  "Acrylic on canvas/linen/panel",
  "Mixed media on paper/canvas",
  "Oil on canvas/panel",
];

const mediumFilterOptions = mediumOptions.map((option) => ({
  option: option,
  value: option,
}));

export default function MediumFilter({
  open,
  toggleOpen,
}: {
  open: boolean;
  toggleOpen: () => void;
}) {
  const { filterOptions } = filterStore();

  return (
    <div className="py-4 w-full">
      <div
        onClick={toggleOpen}
        className="flex justify-between items-center cursor-pointer group"
      >
        <div className="flex gap-x-4 items-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-dark group-hover:text-dark transition-colors">
            Medium
          </span>
          {filterOptions.medium.length > 0 && (
            <span className="text-[10px] font-mono text-dark underline underline-offset-4">
              ({filterOptions.medium.length})
            </span>
          )}
        </div>
        <span className="text-xl font-light text-neutral-400 group-hover:text-dark transition-colors">
          {open ? "−" : "+"}
        </span>
      </div>

      <FilterOptionBox
        filters={mediumFilterOptions}
        label="medium"
        open={open}
      />
    </div>
  );
}
