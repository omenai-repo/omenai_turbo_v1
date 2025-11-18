"use client";
import { useState, useEffect } from "react";
import { GiSettingsKnobs } from "react-icons/gi";
import { MdClear } from "react-icons/md";
import { ImBin2 } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";
import PriceFilter from "./PriceFilter";
import MediumFilter from "./MediumFilter";
import YearFilter from "./YearFilter";
import RarityFilter from "./RarityFilter";
import FilterPill from "./FilterPill";
import { isEmptyFilter } from "@omenai/shared-utils/src/isFilterEmpty";
import { toast } from "sonner";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";

export default function Filter() {
  const [showFilterBlock, setShowFilterBlock] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { filterOptions, selectedFilters, clearAllFilters } = filterStore();
  const { currentPage, setCurrentPage } = artworkActionStore();
  const { setArtworks, setIsLoading, setPageCount, set_artwork_total } =
    artworkStore();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 960);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmitFilter = async () => {
    setCurrentPage(1);
    setIsLoading(true);
    const response = await fetchPaginatedArtworks(currentPage, filterOptions);
    if (response?.isOk) {
      setPageCount(response.count);
      set_artwork_total(response.total);
      setArtworks(response.data);
    } else {
      toast.error("Error notification", {
        description: response?.message,
        style: { background: "red", color: "white" },
      });
    }
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = async () => {
    clearAllFilters();
    setIsLoading(true);
    const response = await fetchPaginatedArtworks(currentPage, {
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
      {/* Toggle Button */}
      {!isDesktop && (
        <div className="w-full mb-2">
          <button
            className={`${showFilterBlock ? "bg-dark text-white" : "border-dark/10 border bg-white text-dark"} duration-200 border px-3 py-1 rounded flex gap-x-2 items-center text-fluid-xxs font-normal w-fit cursor-pointer`}
            onClick={() => setShowFilterBlock(!showFilterBlock)}
            aria-expanded={showFilterBlock}
            aria-label="Toggle filter block"
          >
            <span className="text-fluid-xxs font-normal">Filters</span>
            {showFilterBlock ? (
              <MdClear />
            ) : (
              <GiSettingsKnobs className="rotate-90" />
            )}
          </button>
        </div>
      )}

      {/* Selected Filters + Actions */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center py-4 px-2 cursor-pointer">
          {selectedFilters.map((filter) => (
            <FilterPill key={filter.name} filter={filter.name} />
          ))}
          <div
            onClick={handleClearAll}
            className="px-3 py-1 border border-dark/10 rounded hover:bg-dark duration-200 hover:text-white flex gap-x-2 items-center text-fluid-xxs font-normal"
          >
            <span>Clear all selections</span>
            <ImBin2 />
          </div>
          <button
            onClick={handleSubmitFilter}
            disabled={isEmptyFilter(filterOptions)}
            className="px-3 py-1 bg-dark hover:bg-dark duration-200 text-white rounded flex gap-x-2 items-center text-fluid-xxs font-normal"
          >
            <span>Apply filters</span>
            <FaCheckCircle />
          </button>
        </div>
      )}

      {/* Filter Block */}
      {(isDesktop || showFilterBlock) && (
        <div className="flex flex-wrap gap-4 mt-2">
          <PriceFilter />
          <YearFilter />
          <MediumFilter />
          <RarityFilter />
        </div>
      )}
    </div>
  );
}
