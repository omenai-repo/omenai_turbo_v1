"use client";
import { GiSettingsKnobs } from "react-icons/gi";
import { useContext, useState } from "react";
import { toast } from "sonner";
import FilterPill from "./FilterPill";
import { ImBin2 } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";
import { useWindowSize } from "usehooks-ts";
import { MdClear } from "react-icons/md";
import { fetchTrendingArtworks } from "@omenai/shared-services/artworks/fetchTrendingArtworks";
import PriceFilter from "./PriceFilter";
import YearFilter from "./YearFilter";
import MediumFilter from "./MediumFilter";
import RarityFilter from "./RarityFilter";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchCuratedArtworks } from "@omenai/shared-services/artworks/fetchedCuratedArtworks";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { categoriesFilterStore } from "@omenai/shared-state-store/src/categories/categoriesFilterStore";
import { categoriesStore } from "@omenai/shared-state-store/src/categories/categoriesStore";
import {
  artworkCollectionTypes,
  IndividualSchemaTypes,
} from "@omenai/shared-types";
import { isEmptyFilter } from "@omenai/shared-utils/src/isFilterEmpty";

export default function Filter({
  page_type,
}: {
  page_type: artworkCollectionTypes;
}) {
  const { session } = useContext(SessionContext);
  const [showFilterBlock, setShowFilterBlock] = useState(false);
  const { width } = useWindowSize();

  const { filterOptions, selectedFilters, clearAllFilters } =
    categoriesFilterStore();
  const {
    setArtworks,
    setIsLoading,
    currentPage,
    setCurrentPage,
    pageCount,
    setPageCount,
  } = categoriesStore();

  async function handleSubmitFilter() {
    setCurrentPage(1);
    setIsLoading(true);
    let response;

    if (page_type === "trending") {
      response = await fetchTrendingArtworks(currentPage, filterOptions);
    } else if (page_type === "curated") {
      //update to curated
      response = await fetchCuratedArtworks(currentPage, filterOptions);
    } else if (page_type === "recent") {
      //update to recent
      response = await fetchPaginatedArtworks(currentPage, filterOptions);
    }

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
    //visis the clear section
    let response;

    const emptyFilters = {
      price: [],
      year: [],
      medium: [],
      rarity: [],
    };

    if (page_type === "trending") {
      response = await fetchTrendingArtworks(currentPage, emptyFilters);
    } else if (page_type === "curated") {
      //update to curated
      response = await fetchCuratedArtworks(currentPage, emptyFilters);
    } else if (page_type === "recent") {
      //update to recent
      response = await fetchPaginatedArtworks(currentPage, emptyFilters);
    }

    if (response?.isOk) {
      setArtworks(response?.data);
      setCurrentPage(1);
    }
  };

  return (
    <div className="sticky top-[60px] z-20 pb-4 pt-8 bg-white">
      <div
        className={`w-full ${
          width > 960 ? "hidden" : "flex"
        } justify-between items-center py-4`}
      >
        <button
          className={`${
            showFilterBlock
              ? "bg-dark text-white"
              : "border-dark/10 border bg-white text-dark"
          } duration-200 border px-3 py-1 border-dark/10 rounded-full  flex gap-x-2 items-center text-[13px] font-normal w-fit cursor-pointer`}
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
          <div className="flex flex-wrap gap-2 items-center py-4 cursor-pointer">
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
        } flex flex-wrap gap-x-2`}
      >
        <PriceFilter filterOptions={filterOptions} />
        <YearFilter filterOptions={filterOptions} />
        <MediumFilter filterOptions={filterOptions} />
        <RarityFilter filterOptions={filterOptions} />
      </div>
    </div>
  );
}
