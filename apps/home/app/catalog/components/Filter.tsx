"use client";
import { GiSettingsKnobs } from "react-icons/gi";
import PriceFilter from "./PriceFilter";
import MediumFilter from "./MediumFilter";
import { useState } from "react";
import { isEmptyFilter } from "@omenai/shared-utils/src/isFilterEmpty";

import { toast } from "sonner";
import { ImBin2 } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";
import { useWindowSize } from "usehooks-ts";
import { MdClear } from "react-icons/md";
import { useRouter } from "next/navigation";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import FilterPill from "./FilterPill";
import YearFilter from "./YearFilter";
import RarityFilter from "./RarityFilter";

export default function Filter({ isMedium = false }: { isMedium?: boolean }) {
  const [showFilterBlock, setShowFilterBlock] = useState(false);
  const { width } = useWindowSize();

  const { filterOptions, selectedFilters, clearAllFilters } = filterStore();
  const { paginationCount, updatePaginationCount } = artworkActionStore();
  const { setArtworks, setIsLoading, setPageCount } = artworkStore();
  const router = useRouter();
  async function handleSubmitFilter() {
    updatePaginationCount("reset");
    setIsLoading(true);
    const response = await fetchPaginatedArtworks(
      paginationCount,
      filterOptions
    );
    if (response?.isOk) {
      setPageCount(response.count);
      setArtworks(response.data);
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
    const response = await fetchPaginatedArtworks(paginationCount, {
      price: [],
      year: [],
      medium: [],
      rarity: [],
    });
    if (response?.isOk) {
      setPageCount(response.count);
      setArtworks(response.data);
    }
    setIsLoading(false);
  };

  return (
    <div className="sticky top-[60px] z-20 py-3 bg-white">
      <div
        className={`w-full ${
          width > 960 ? "hidden" : "flex"
        } justify-between items-center`}
      >
        <button
          className={`${
            showFilterBlock
              ? "bg-dark text-white"
              : "border-dark/10 border bg-white text-dark"
          } duration-200 border px-3 py-1 border-dark/10 rounded-full relative z-20 h-[35px] flex gap-x-2 items-center text-[13px] font-normal w-fit cursor-pointer`}
          onClick={() => setShowFilterBlock(!showFilterBlock)}
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
          <div className="flex flex-wrap gap-4 items-center py-4 px-2 cursor-pointer">
            {selectedFilters.map((filter) => {
              return <FilterPill key={filter.name} filter={filter.name} />;
            })}
            <div
              onClick={handleClearAll}
              className="px-3 py-1 border border-dark/10 rounded-full hover:bg-dark duration-200 hover:text-white flex gap-x-2 items-center text-[13px] font-normal"
            >
              <span>Clear all selections</span>
              <ImBin2 />
            </div>
            <button
              onClick={handleSubmitFilter}
              disabled={isEmptyFilter(filterOptions)}
              className="px-3 py-1 bg-dark hover:bg-dark duration-200 text-white rounded-full flex gap-x-2 items-center text-[13px] font-normal"
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
        } grid grid-cols-2 mt-2 md:flex md:flex-wrap relative`}
      >
        <PriceFilter />
        <YearFilter />
        <MediumFilter />
        <RarityFilter />
      </div>
    </div>
  );
}
