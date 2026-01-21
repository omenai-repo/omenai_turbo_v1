"use client";
import FilterOptionBox from "./FilterOptionBox";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";

const rarityFilterOptions = [
  { option: "Unique Work", value: "Unique" },
  { option: "Limited Edition", value: "Limited edition" },
  { option: "Open Edition", value: "Open edition" },
  { option: "Unknown edition", value: "Unknown edition" },
];

export default function RarityFilter({
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
            Classification
          </span>
          {filterOptions.rarity.length > 0 && (
            <span className="text-[10px] font-mono text-dark underline underline-offset-4">
              ({filterOptions.rarity.length})
            </span>
          )}
        </div>
        <span className="text-xl font-light text-neutral-400 group-hover:text-dark transition-colors">
          {open ? "−" : "+"}
        </span>
      </div>

      <FilterOptionBox
        filters={rarityFilterOptions}
        label="rarity"
        open={open}
      />
    </div>
  );
}
