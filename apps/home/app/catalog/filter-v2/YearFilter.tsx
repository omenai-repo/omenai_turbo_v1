"use client";
import FilterOptionBox from "./FilterOptionBox";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";

const yearFilterOptions = [
  { option: "2020s — Present", value: { min: 2020, max: 2029 } },
  { option: "2010s", value: { min: 2010, max: 2019 } },
  { option: "2000s", value: { min: 2000, max: 2009 } },
  { option: "Modernist Era", value: { min: 1900, max: 1999 } },
  { option: "Historical", value: { min: 0, max: 1899 } },
];

export default function YearFilter({
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
            Year of Creation
          </span>
          {filterOptions.year.length > 0 && (
            <span className="text-[10px] font-mono text-dark underline underline-offset-4">
              ({filterOptions.year.length})
            </span>
          )}
        </div>
        <span className="text-xl font-light text-neutral-400 group-hover:text-dark transition-colors">
          {open ? "−" : "+"}
        </span>
      </div>

      <FilterOptionBox filters={yearFilterOptions} label="year" open={open} />
    </div>
  );
}
