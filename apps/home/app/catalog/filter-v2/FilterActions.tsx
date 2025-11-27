"use client";

import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { useFilterDrawer } from "./FilterDrawerProvider";

export default function FilterActions() {
  const { closeDrawer } = useFilterDrawer();
  const { filterOptions, clearAllFilters, selectedFilters } = filterStore();
  const { currentPage } = artworkActionStore();
  const { setArtworks, setPageCount, set_artwork_total, setIsLoading } =
    artworkStore();

  const handleApply = async () => {
    setIsLoading(true);
    const response = await fetchPaginatedArtworks(currentPage, filterOptions);
    if (response?.isOk) {
      setArtworks(response.data);
      setPageCount(response.count);
      set_artwork_total(response.total);
    }
    setIsLoading(false);
    closeDrawer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClear = async () => {
    clearAllFilters();
    setIsLoading(true);
    const response = await fetchPaginatedArtworks(currentPage, {
      price: [],
      year: [],
      medium: [],
      rarity: [],
    });
    if (response?.isOk) {
      setArtworks(response.data);
      setPageCount(response.count);
      set_artwork_total(response.total);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleClear}
        className="flex-1 px-4 py-2 bg-slate-100 text-gray-700 rounded text-fluid-xxs hover:bg-slate-200"
      >
        Clear All
      </button>
      <button
        onClick={handleApply}
        disabled={selectedFilters.length === 0}
        className="flex-1 px-4 py-2 bg-dark text-white rounded text-fluid-xxs hover:bg-black disabled:opacity-50"
      >
        Apply
      </button>
    </div>
  );
}
