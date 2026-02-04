import { useQuery } from "@tanstack/react-query";
import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";

export function useArtworksPagination() {
  const { currentPage, setCurrentPage } = artworkActionStore();
  const {
    isLoading,
    setArtworks,
    setIsLoading,
    artworks,
    artwork_total,
    set_artwork_total,
    setPageCount,
    pageCount,
  } = artworkStore();
  const { filterOptions } = filterStore();

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["get_paginated_artworks"],
    queryFn: async () => {
      const response = await fetchPaginatedArtworks(currentPage, filterOptions);
      if (response?.isOk) {
        setArtworks(response.data);
        set_artwork_total(response.total);
        setPageCount(response.count);
        return { data: response.data, pages: response.count };
      } else throw new Error("Failed to fetch artworks");
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    artworksArray,
    loading,
    isLoading,
    artworks,
    artwork_total,
    pageCount,
    currentPage,
    setCurrentPage,
    setArtworks,
    setIsLoading,
    filterOptions,
  };
}
