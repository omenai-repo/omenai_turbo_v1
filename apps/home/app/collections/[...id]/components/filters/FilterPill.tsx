"use client";

import { fetchTrendingArtworks } from "@omenai/shared-services/artworks/fetchTrendingArtworks";
import { collectionsFilterStore } from "@omenai/shared-state-store/src/collections/collectionsFilterStore";
import { collectionsStore } from "@omenai/shared-state-store/src/collections/collectionsStore";
import { MdClear } from "react-icons/md";

export default function FilterPill({ filter }: { filter: string }) {
  const { removeSingleFilterSelection, selectedFilters } =
    collectionsFilterStore();
  // const { currentPage, updatecurrentPage } = artworkActionStore();
  const { setArtworks, setPageCount, currentPage } = collectionsStore();

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
    <button
      type="button"
      onClick={handleRemoveSingleFilter}
      className="px-3 py-1.5 bg-[#f7f7f7] text-[13px] font-light text-dark flex items-center gap-x-2 rounded"
    >
      <span className="text-fluid-xxs">{filter}</span>
      <MdClear className="cursor-pointer" />
    </button>
  );
}
