"use client";
import { GiSettingsKnobs } from "react-icons/gi";
import { useState } from "react";
import { toast } from "sonner";
import FilterPill from "./FilterPill";
import { ImBin2 } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";
import { useWindowSize } from "usehooks-ts";
import { MdClear } from "react-icons/md";
import PriceFilter from "./PriceFilter";
import YearFilter from "./YearFilter";
import RarityFilter from "./RarityFilter";
import { fetchArtworksByCriteria } from "@omenai/shared-services/artworks/fetchArtworksByCriteria";
import { collectionsFilterStore } from "@omenai/shared-state-store/src/collections/collectionsFilterStore";
import { collectionsStore } from "@omenai/shared-state-store/src/collections/collectionsStore";
import { isEmptyFilter } from "@omenai/shared-utils/src/isFilterEmpty";

export default function Filter({ medium }: { medium: string }) {
  const [showFilterBlock, setShowFilterBlock] = useState(false);
  const { width } = useWindowSize();

  const { filterOptions, selectedFilters, clearAllFilters } =
    collectionsFilterStore();
  const {
    setArtworks,
    setIsLoading,
    currentPage,
    setCurrentPage,
    pageCount,
    setPageCount,
  } = collectionsStore();

  async function handleSubmitFilter() {
    setCurrentPage(1);
    setIsLoading(true);

    const response = await fetchArtworksByCriteria(
      currentPage,
      filterOptions,
      medium
    );

    if (response?.isOk) {
      setPageCount(1);
      setArtworks(response?.data);
    } else {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
    setIsLoading(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const handleClearAll = async () => {
    clearAllFilters();
    setIsLoading(true);
    const emptyFilters = {
      price: [],
      year: [],
      medium: [],
      rarity: [],
    };

    const response = await fetchArtworksByCriteria(
      currentPage,
      emptyFilters,
      medium
    );

    if (response?.isOk) {
      setCurrentPage(1);
      setArtworks(response.data);
    }
    setIsLoading(false);
  };

  return (
    <div className="sticky top-[38px] sm:top-[50px] lg:top-[73px] px-0 lg:px-4 z-20 py-3 bg-white">
      <div
        className={`w-full ${
          width > 960 ? "hidden" : "flex"
        } justify-between items-center py-4 px-3`}
      >
        <button
          className={`${
            showFilterBlock
              ? "bg-dark text-white"
              : "border-dark/10 border bg-white text-dark"
          } duration-200 border px-3 py-1 border-dark/10 rounded h-[35px] flex gap-x-2 items-center text-[13px] font-normal w-fit cursor-pointer`}
          onClick={() => setShowFilterBlock((prev) => !prev)}
        >
          <span className="text-[13px] font-normal">Filters</span>
          {showFilterBlock ? (
            <MdClear />
          ) : (
            <GiSettingsKnobs className="rotate-90" />
          )}
        </button>
        <div />
      </div>
      {selectedFilters.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 items-center py-4 px-2 cursor-pointer">
            {selectedFilters.map((filter) => {
              return <FilterPill key={filter.name} filter={filter.name} />;
            })}
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1 border border-dark/10 rounded hover:bg-dark duration-200 hover:text-white flex gap-x-2 items-center text-[13px] font-normal"
            >
              <span>Clear all selections</span>
              <ImBin2 />
            </button>
            <button
              onClick={handleSubmitFilter}
              disabled={isEmptyFilter(filterOptions)}
              className="px-3 py-1 bg-dark hover:bg-dark duration-200 text-white rounded flex gap-x-2 items-center text-[13px] font-normal"
            >
              <span>Apply filters </span>
              <FaCheckCircle />
            </button>
          </div>
        </>
      )}

      <div
        className={`${
          width >= 960 || showFilterBlock ? "flex" : "hidden"
        } grid grid-cols-2 md:flex md:flex-wrap relative`}
      >
        <PriceFilter filterOptions={filterOptions} />
        <YearFilter filterOptions={filterOptions} />
        {/* <MediumFilter filterOptions={filterOptions} /> */}
        <RarityFilter filterOptions={filterOptions} />
      </div>
    </div>
  );
}
