"use client";
import FilterOptionBox from "./FilterOptionBox";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";

const priceFilterOptions = [
  { option: "$0 to $1,000", value: { min: 0, max: 1000 } },
  { option: "$1,001 to $10,000", value: { min: 1001, max: 10000 } },
  { option: "$10,001 to $50,000", value: { min: 1001, max: 50000 } },
  { option: "Premium Range", value: { min: 50001, max: 10000000 } },
];

export default function PriceFilter({
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
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-dark transition-colors">
            Price Range
          </span>
          {filterOptions.price.length > 0 && (
            <span className="text-[10px] font-mono text-dark underline underline-offset-4">
              ({filterOptions.price.length})
            </span>
          )}
        </div>
        <span className="text-xl font-light text-neutral-400 group-hover:text-dark transition-colors">
          {open ? "−" : "+"}
        </span>
      </div>

      <FilterOptionBox filters={priceFilterOptions} label="price" open={open} />
    </div>
  );
}
