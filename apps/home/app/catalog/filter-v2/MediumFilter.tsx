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
  "Sculpture (Resin/plaster/clay)",
  "Oil on canvas/panel",
  "Sculpture (Bronze/stone/metal)",
];

const mediumFilterOptions = mediumOptions.map((option) => ({
  option: option,
  value: option,
}));

export default function MediumFilter({ open, toggleOpen }: Props) {
  const { filterOptions } = filterStore();

  return (
    <div className="p-2 w-full">
      <div
        onClick={toggleOpen}
        className={`${SELECT_CLASS} flex justify-between items-center`}
      >
        <p className="flex gap-x-2 items-center">
          <span className="text-fluid-xxs font-light">Medium</span>
          {filterOptions.medium.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded bg-dark/10">
              <span className="absolute translate-x-[0%] translate-y-[0%]">
                {filterOptions.medium.length}
              </span>
            </span>
          )}
        </p>
        <MdOutlineKeyboardArrowDown
          className={`${open ? "rotate-180" : ""} transition-transform`}
        />
      </div>

      <FilterOptionBox
        filters={mediumFilterOptions}
        label="medium"
        open={open}
      />
    </div>
  );
}
