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
    <div className="flex gap-0 border-t border-neutral-100 pt-6">
      <button
        onClick={handleClear}
        className="flex-1 px-4 py-4 bg-white text-neutral-400 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-dark transition-colors"
      >
        Reset All
      </button>
      <button
        onClick={handleApply}
        disabled={selectedFilters.length === 0}
        className="flex-1 px-4 py-4 bg-dark text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-800 disabled:bg-neutral-200 transition-all"
      >
        Show Results
      </button>
    </div>
  );
}
