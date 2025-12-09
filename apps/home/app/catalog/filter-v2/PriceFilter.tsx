"use client";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import FilterOptionBox from "./FilterOptionBox";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

type Props = {
  open: boolean;
  toggleOpen: () => void;
};

const priceFilterOptions = [
  { option: "$0 to $1000", value: { min: 0, max: 1000 } },
  { option: "$1001 to $10000", value: { min: 1001, max: 10000 } },
  { option: "$10001 to $50000", value: { min: 10001, max: 50000 } },
  { option: "$50001 to $100000", value: { min: 50001, max: 100000 } },
  { option: "$100001 to $500000", value: { min: 100001, max: 500000 } },
  { option: "$500000+", value: { min: 500001, max: 10000000000 } },
];

export default function PriceFilter({ open, toggleOpen }: Props) {
  const { filterOptions } = filterStore();

  return (
    <div className="p-2 w-full">
      <div
        onClick={toggleOpen}
        className={`${SELECT_CLASS} flex justify-between items-center`}
      >
        <p className="flex gap-x-2 items-center">
          <span className="font-light">Price</span>
          {filterOptions.price.length > 0 && (
            <span className="relative h-2 w-2 p-2.5 grid place-items-center rounded bg-dark/10">
              <span className="absolute translate-x-[0%] translate-y-[0%]">
                {filterOptions.price.length}
              </span>
            </span>
          )}
        </p>
        <MdOutlineKeyboardArrowDown
          className={`${open ? "rotate-180" : ""} transition-transform`}
        />
      </div>

      <FilterOptionBox filters={priceFilterOptions} label="price" open={open} />
    </div>
  );
}
