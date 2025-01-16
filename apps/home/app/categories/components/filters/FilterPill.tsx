"use client";

import { fetchTrendingArtworks } from "@omenai/shared-services/artworks/fetchTrendingArtworks";
import { categoriesFilterStore } from "@omenai/shared-state-store/src/categories/categoriesFilterStore";
import { categoriesStore } from "@omenai/shared-state-store/src/categories/categoriesStore";
import { MdClear } from "react-icons/md";

export default function FilterPill({ filter }: { filter: string }) {
  const { removeSingleFilterSelection, selectedFilters } =
    categoriesFilterStore();
  const { setArtworks, setIsLoading, setPageCount, currentPage } =
    categoriesStore();

  async function handleRemoveSingleFilter() {
    if (selectedFilters.length === 1) {
      removeSingleFilterSelection(filter);
      const response = await fetchTrendingArtworks(currentPage, {
        price: [],
        year: [],
        medium: [],
        rarity: [],
      });
      if (response?.isOk) {
        setArtworks(response.data);
        setPageCount(response.count);
      }
    } else {
      removeSingleFilterSelection(filter);
    }
  }

  return (
    <div
      onClick={handleRemoveSingleFilter}
      className="px-3 py-1.5 bg-[#f7f7f7] text-[13px] font-normal text-dark flex items-center gap-x-2 rounded-full"
    >
      <span className="text-[14px]">{filter}</span>
      <MdClear className="cursor-pointer" />
    </div>
  );
}
