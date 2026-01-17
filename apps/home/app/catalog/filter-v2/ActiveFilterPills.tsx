"use client";

import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { MdClear } from "react-icons/md";

export default function ActiveFilterPills() {
  const { selectedFilters, removeSingleFilterSelection, filterOptions } =
    filterStore();
  const { currentPage, setCurrentPage } = artworkActionStore();
  const { setArtworks, setPageCount, set_artwork_total, setIsLoading } =
    artworkStore();

  const handleRemove = async (filter: string) => {
    removeSingleFilterSelection(filter);
    setCurrentPage(1);
    setIsLoading(true);

    const filtersToApply = {
      price: filterOptions.price,
      year: filterOptions.year,
      medium: filterOptions.medium,
      rarity: filterOptions.rarity,
    };

    const response = await fetchPaginatedArtworks(currentPage, filtersToApply);

    if (response?.isOk) {
      setArtworks(response.data);
      setPageCount(response.count);
      set_artwork_total(response.total);
    }

    setIsLoading(false);
  };

  if (selectedFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {selectedFilters.map((filter) => (
        <div
          key={filter.name}
          onClick={() => handleRemove(filter.name)}
          className="px-3 py-1 bg-white border border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-dark flex items-center gap-x-3 cursor-pointer hover:border-black transition-colors group"
        >
          <span>{filter.name}</span>
          <MdClear className="text-neutral-400 group-hover:text-red-500 transition-colors" />
        </div>
      ))}
    </div>
  );
}
